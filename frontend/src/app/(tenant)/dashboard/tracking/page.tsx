'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTenant } from '@/context/TenantContext';
import { iotService, vehicleService, IotDevice } from '@/services';
import { Vehicle } from '@/types';
import { Modal } from '@/components/ui/Modal';
import {
  Radio,
  Car,
  Navigation,
  Lock,
  Unlock,
  BatteryCharging,
  Cpu,
  Power,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Compass,
  MapPin,
  Play,
} from 'lucide-react';

export default function FleetTrackingPage() {
  const { tenant } = useTenant();
  const [devices, setDevices] = useState<IotDevice[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDevice, setSelectedDevice] = useState<IotDevice | null>(null);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'LOCKED'>('ALL');
  const [isPairOpen, setIsPairOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pair form state
  const [pairVehicleId, setPairVehicleId] = useState<string>('');
  const [pairImei, setPairImei] = useState<string>('');
  const [pairName, setPairName] = useState<string>('');
  const [pairModel, setPairModel] = useState<string>('Teltonika FMB920');
  const [pairSim, setPairSim] = useState<string>('');
  const [pairSubmitting, setPairSubmitting] = useState<boolean>(false);

  // Map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  const showNotice = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const loadData = async () => {
    if (!tenant?.id) return;
    try {
      const [devList, vehList] = await Promise.all([
        iotService.getTenantDevices(tenant.id),
        vehicleService.getTenantVehicles(tenant.id),
      ]);
      setDevices(devList || []);
      setVehicles(vehList || []);

      if (devList && devList.length > 0 && !selectedDevice) {
        setSelectedDevice(devList[0]);
      }
    } catch (err: any) {
      console.error('Failed to load tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [tenant?.id]);

  // Dynamically load Leaflet for Next.js SSR-safe map rendering
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = () => {
      if ((window as any).L && mapContainerRef.current && !mapInstanceRef.current) {
        initMap();
        return;
      }

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setTimeout(initMap, 200);
        };
        document.body.appendChild(script);
      }
    };

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current || mapInstanceRef.current) return;

      // Default Kathmandu Valley Center
      const centerLat = selectedDevice?.lastLatitude || 27.7172;
      const centerLng = selectedDevice?.lastLongitude || 85.324;

      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      updateMarkers(devices);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when devices change
  const updateMarkers = (deviceList: IotDevice[]) => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    deviceList.forEach((dev) => {
      const lat = dev.lastLatitude || 27.7172;
      const lng = dev.lastLongitude || 85.324;
      const isLocked = dev.isEngineLocked;
      const isMoving = (dev.lastSpeed || 0) > 0;

      const markerColor = isLocked
        ? '#ef4444' // Red if locked
        : isMoving
        ? '#10b981' // Green if moving
        : dev.ignitionStatus
        ? '#f59e0b' // Yellow if idling
        : '#64748b'; // Slate if parked

      const customIcon = L.divIcon({
        className: 'custom-fleet-marker',
        html: `
          <div style="background-color: ${markerColor}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight: bold; font-size: 11px;">
            ${isLocked ? '🔒' : isMoving ? '🚗' : '🅿️'}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; font-size: 12px;">
          <strong style="font-size: 13px;">${dev.vehicle?.plateNumber || dev.deviceName}</strong><br/>
          <span style="color: #64748b;">${dev.vehicle?.brand || ''} ${dev.vehicle?.model || ''}</span><br/>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            Speed: <strong>${dev.lastSpeed || 0} km/h</strong><br/>
            Engine: <strong style="color: ${isLocked ? '#ef4444' : '#10b981'};">${isLocked ? 'IMMOBILIZED' : 'ACTIVE'}</strong><br/>
            Battery: <strong>${dev.batteryLevel || 100}%</strong>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedDevice(dev);
      });

      markersRef.current[dev.id] = marker;
    });
  };

  useEffect(() => {
    if (mapInstanceRef.current && (window as any).L) {
      updateMarkers(devices);
    }
  }, [devices]);

  const handleFocusVehicle = (dev: IotDevice) => {
    setSelectedDevice(dev);
    if (mapInstanceRef.current && dev.lastLatitude && dev.lastLongitude) {
      mapInstanceRef.current.flyTo([dev.lastLatitude, dev.lastLongitude], 15, {
        duration: 1.2,
      });
      const marker = markersRef.current[dev.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  // Remote Engine Cutoff / Immobilizer Switch
  const handleToggleEngine = async (dev: IotDevice) => {
    if (!tenant?.id) return;
    const nextState = !dev.isEngineLocked;

    const confirmMsg = nextState
      ? `Are you sure you want to IMMOBILIZE the engine for ${dev.vehicle?.plateNumber || dev.deviceName}? The ignition relay will cut fuel to stop the vehicle.`
      : `Restore engine ignition for ${dev.vehicle?.plateNumber || dev.deviceName}?`;

    if (!confirm(confirmMsg)) return;

    setActionLoading(dev.id);
    try {
      const res = await iotService.toggleEngineLock(tenant.id, dev.id, nextState);
      setDevices((prev) =>
        prev.map((d) => (d.id === dev.id ? { ...d, isEngineLocked: nextState } : d)),
      );
      if (selectedDevice?.id === dev.id) {
        setSelectedDevice((prev) => (prev ? { ...prev, isEngineLocked: nextState } : null));
      }
      showNotice('success', res.message);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to toggle engine immobilizer relay');
    } finally {
      setActionLoading(null);
    }
  };

  // Simulate movement ping for instant interactive demonstration
  const handleSimulatePing = async (dev: IotDevice) => {
    if (!tenant?.id) return;
    setActionLoading(`sim-${dev.id}`);
    try {
      await iotService.simulateMovement(tenant.id, dev.id);
      await loadData();
      showNotice('success', `Simulated telemetry packet received for ${dev.vehicle?.plateNumber || dev.deviceName}`);
    } catch (err: any) {
      showNotice('error', err.message || 'Simulation failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;

    if (!pairImei.trim() || !pairName.trim()) {
      alert('Please fill in IMEI and device friendly name');
      return;
    }

    setPairSubmitting(true);
    try {
      const paired = await iotService.pairDevice(tenant.id, {
        imei: pairImei.trim(),
        deviceName: pairName.trim(),
        vehicleId: pairVehicleId || undefined,
        model: pairModel,
        simNumber: pairSim.trim() || undefined,
      });

      setDevices((prev) => [paired, ...prev]);
      setIsPairOpen(false);
      setPairImei('');
      setPairName('');
      setPairSim('');
      setPairVehicleId('');
      showNotice('success', `Tracker "${paired.deviceName}" (${paired.imei}) paired successfully!`);
      handleFocusVehicle(paired);
    } catch (err: any) {
      alert(err.message || 'Failed to pair device');
    } finally {
      setPairSubmitting(false);
    }
  };

  const handleUnpair = async (deviceId: string) => {
    if (!tenant?.id || !confirm('Are you sure you want to unpair/delete this IoT tracking device?')) return;

    try {
      await iotService.unpairDevice(tenant.id, deviceId);
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(null);
      }
      showNotice('success', 'Tracker unpaired successfully.');
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to unpair device');
    }
  };

  // Metrics
  const totalTracked = devices.length;
  const activeMoving = devices.filter((d) => (d.lastSpeed || 0) > 0 && !d.isEngineLocked).length;
  const engineLockedCount = devices.filter((d) => d.isEngineLocked).length;

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      d.imei.toLowerCase().includes(search.toLowerCase()) ||
      (d.vehicle?.plateNumber && d.vehicle.plateNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'ONLINE' && d.status === 'ONLINE' && !d.isEngineLocked) ||
      (filter === 'OFFLINE' && d.status === 'OFFLINE') ||
      (filter === 'LOCKED' && d.isEngineLocked);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-indigo-600 animate-pulse" />
            <span>Fleet IoT Telematics & Live GPS</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time vehicle telemetry, satellite location tracking, and remote engine cutoff security relay.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh fleet telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsPairOpen(true)}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Pair IoT Device</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[11px] underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Total Trackers</span>
          <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-900 dark:text-white mt-1">
            {totalTracked}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Hardware Connected</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-emerald-600 font-medium block">Moving Live</span>
          <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-emerald-600 mt-1">
            {activeMoving}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Active on Road</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Parked / Standby</span>
          <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-700 dark:text-slate-300 mt-1">
            {Math.max(0, totalTracked - activeMoving - engineLockedCount)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Ignition Idle</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-rose-600 font-medium block">Engine Immobilized</span>
          <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-rose-600 mt-1">
            {engineLockedCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Remote Relay Cutoff</span>
        </div>
      </div>

      {/* Main Map + Fleet Roster Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Column: Device & Vehicle Roster */}
        <div className="lg:col-span-5 flex flex-col space-y-3.5">
          {/* Search & Filter */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plate, IMEI or tracker name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field text-xs pl-9"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(['ALL', 'ONLINE', 'LOCKED', 'OFFLINE'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    filter === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Units' : st === 'ONLINE' ? 'Live Moving' : st === 'LOCKED' ? 'Engine Cut' : 'Offline'}
                </button>
              ))}
            </div>
          </div>

          {/* Device Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[540px] pr-1">
            {filteredDevices.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400 space-y-3">
                <Radio className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No paired IoT tracking units found matching criteria.</p>
                <button
                  onClick={() => setIsPairOpen(true)}
                  className="btn-primary text-xs py-2 px-3 mx-auto"
                >
                  Pair First IoT Tracker
                </button>
              </div>
            ) : (
              filteredDevices.map((dev) => {
                const isSelected = selectedDevice?.id === dev.id;
                const isLocked = dev.isEngineLocked;
                const speed = dev.lastSpeed || 0;

                return (
                  <div
                    key={dev.id}
                    onClick={() => handleFocusVehicle(dev)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                            isLocked
                              ? 'bg-rose-500 text-white'
                              : speed > 0
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isLocked ? <Lock className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {dev.vehicle?.plateNumber || dev.deviceName}
                            </span>
                            {isLocked ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                Cutoff Active
                              </span>
                            ) : speed > 0 ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {speed} km/h
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                                Parked
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {dev.vehicle ? `${dev.vehicle.brand} ${dev.vehicle.model}` : dev.deviceName} &bull; {dev.model || 'Teltonika'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {dev.batteryLevel || 100}% batt
                      </span>
                    </div>

                    {/* Sensor & Telemetry Strip */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-slate-400">IMEI: {dev.imei.slice(-6)}</span>
                        <span>Ignition: <strong className={dev.ignitionStatus ? 'text-emerald-600' : 'text-slate-400'}>{dev.ignitionStatus ? 'ON' : 'OFF'}</strong></span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Simulation Ping Button */}
                        <button
                          type="button"
                          disabled={actionLoading === `sim-${dev.id}`}
                          onClick={() => handleSimulatePing(dev)}
                          title="Simulate vehicle moving ping"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                        </button>

                        {/* Remote Engine Cutoff Switch */}
                        <button
                          type="button"
                          disabled={actionLoading === dev.id}
                          onClick={() => handleToggleEngine(dev)}
                          title={isLocked ? 'Restore Engine Ignition' : 'Remote Engine Immobilizer'}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                            isLocked
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900/60'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Unlock</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Cutoff</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Map Container & Telemetry HUD */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative flex-1 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md min-h-[460px] bg-slate-100 dark:bg-slate-900">
            {/* The Leaflet Map DOM Element */}
            <div ref={mapContainerRef} className="w-full h-full min-h-[460px] z-0" />

            {/* Floating Telemetry HUD Banner if vehicle selected */}
            {selectedDevice && (
              <div className="absolute top-4 left-4 right-4 z-10 bg-white/95 dark:bg-[#0c111d]/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                      selectedDevice.isEngineLocked
                        ? 'bg-rose-600'
                        : (selectedDevice.lastSpeed || 0) > 0
                        ? 'bg-emerald-600'
                        : 'bg-slate-700'
                    }`}
                  >
                    {selectedDevice.isEngineLocked ? <Lock className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{selectedDevice.vehicle?.plateNumber || selectedDevice.deviceName}</span>
                      <span className="text-xs font-normal text-slate-500">
                        ({selectedDevice.vehicle?.brand || ''} {selectedDevice.vehicle?.model || ''})
                      </span>
                    </h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>IMEI: {selectedDevice.imei}</span>
                      <span>&bull;</span>
                      <span>Last Seen: {selectedDevice.lastPingAt ? new Date(selectedDevice.lastPingAt).toLocaleTimeString() : 'Just now'}</span>
                    </div>
                  </div>
                </div>

                {/* Kill Switch Toggle in HUD */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleSimulatePing(selectedDevice)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Ping Move</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading === selectedDevice.id}
                    onClick={() => handleToggleEngine(selectedDevice)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                      selectedDevice.isEngineLocked
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    {selectedDevice.isEngineLocked ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>Restore Ignition</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Cutoff Engine Relay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Pair New IoT Tracker */}
      <Modal
        isOpen={isPairOpen}
        onClose={() => setIsPairOpen(false)}
        title="Pair IoT GPS Tracker with Fleet Vehicle"
        subtitle="Connect hardware telemetry (Teltonika, Concox, Sinotrack, OBD-II, ESP32)"
        icon={Radio}
        maxWidth="lg"
      >
        <form onSubmit={handlePairSubmit} className="space-y-4">
          <div>
            <label className="form-label">Select Vehicle from Fleet (Optional)</label>
            <select
              value={pairVehicleId}
              onChange={(e) => {
                setPairVehicleId(e.target.value);
                const veh = vehicles.find((v) => v.id === e.target.value);
                if (veh && !pairName) {
                  setPairName(`${veh.brand} ${veh.model} Tracker`);
                }
              }}
              className="input-field text-xs"
            >
              <option value="">-- Leave Unassigned (Standby Device) --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} ({v.brand} {v.model}) - {v.status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">15-Digit IMEI or Serial Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 864201048291054"
                value={pairImei}
                onChange={(e) => setPairImei(e.target.value)}
                className="input-field font-mono text-xs"
              />
            </div>

            <div>
              <label className="form-label">Friendly Device Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Scorpio GPS Unit #1"
                value={pairName}
                onChange={(e) => setPairName(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Hardware Tracker Model</label>
              <select
                value={pairModel}
                onChange={(e) => setPairModel(e.target.value)}
                className="input-field text-xs"
              >
                <option value="Teltonika FMB920">Teltonika FMB920 (High Precision)</option>
                <option value="Concox GT06N">Concox / Jimi GT06N (Fuel Cut Relay)</option>
                <option value="Sinotrack ST-901">Sinotrack ST-901 (Waterproof)</option>
                <option value="Generic OBD-II">Plug & Play OBD-II Telematics</option>
                <option value="ESP32 Custom">ESP32 / Arduino DIY Tracker</option>
              </select>
            </div>

            <div>
              <label className="form-label">SIM Card Number (NTC/Ncell)</label>
              <input
                type="text"
                placeholder="e.g. +977-9801234567"
                value={pairSim}
                onChange={(e) => setPairSim(e.target.value)}
                className="input-field font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1 border border-slate-200 dark:border-slate-700">
            <strong>Server Ingestion Webhook:</strong>
            <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
              POST https://yourdomain.com/api/v1/iot/telemetry
            </p>
            <p className="text-[10px] text-slate-400">
              Configure your GPRS tracker to post telemetry packets with your IMEI.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPairOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pairSubmitting}
              className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
            >
              {pairSubmitting ? 'Pairing...' : 'Confirm & Connect Tracker'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
