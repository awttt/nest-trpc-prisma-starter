import { basePagerSchema } from '@server/common/dto/pager.dto'
import { MenuOptionalDefaultsSchema } from 'database/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// 创建菜单的输入模式
export const MenuInputSchema = MenuOptionalDefaultsSchema.pick({
  name: true,
  path: true,
  icon: true,
  component: true,
  sort: true,
  hidden: true,
  status: true,
  permissions: true,
  parentId: true,
})

// 创建菜单的DTO类
export class MenuDto extends createZodDto(MenuInputSchema) {}

// 更新菜单的DTO类（所有字段都是可选的）
export class MenuUpdateDto extends createZodDto(MenuInputSchema.partial()) {}

// 菜单分页查询DTO
export class MenuPagerDto extends createZodDto(basePagerSchema.extend({
  sortBy: z.enum(['createdAt', 'updatedAt', 'sort', 'level']).optional(),
  name: z.string().optional(),
  status: z.boolean().optional(),
  parentId: z.string().optional().nullable(),
})) {}