import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  getSchemaPath,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ApiResponseDto, ApiErrorResponseDto, PaginatedResponseDto } from '../dto/api-response.dto';

export function ApiCustomResponse<TModel extends Type<any>>(
  model: TModel,
  status: number = 200,
  description: string = 'Successful Operation',
) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
}

export function ApiPaginatedResponse<TModel extends Type<any>>(
  model: TModel,
  description: string = 'Paginated List',
) {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
}

export function ApiErrorResponses() {
  return applyDecorators(
    ApiResponse({ status: 400, description: 'Bad Request / Validation Error', type: ApiErrorResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized / Invalid Bearer Token', type: ApiErrorResponseDto }),
    ApiResponse({ status: 403, description: 'Forbidden / Insufficient Role Permissions', type: ApiErrorResponseDto }),
    ApiResponse({ status: 404, description: 'Resource Not Found', type: ApiErrorResponseDto }),
    ApiResponse({ status: 500, description: 'Internal Server Error', type: ApiErrorResponseDto }),
  );
}

export function ApiAuth() {
  return applyDecorators(
    ApiBearerAuth('bearer-auth'),
    ApiErrorResponses(),
  );
}

export function ApiFileUpload(fieldName: string = 'file', description: string = 'File attachment upload') {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description,
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}
