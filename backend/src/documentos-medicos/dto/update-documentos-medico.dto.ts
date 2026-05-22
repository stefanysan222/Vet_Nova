import { PartialType } from '@nestjs/swagger';

import { CreateDocumentoDto } from './create-documentos-medico.dto';

export class UpdateDocumentosMedicoDto extends PartialType(
  CreateDocumentoDto,
) {}