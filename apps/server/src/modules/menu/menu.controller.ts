import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'

import { Action } from '../casl/ability.class'
import { Policy } from '../casl/policy.decortor'
import { PolicyGuard } from '../casl/policy.guard'

import { MenuDto, MenuPagerDto, MenuUpdateDto } from './menu.dto'
import { MenuService } from './menu.service'

@ApiTags('System - 菜单管理')
@UseGuards(PolicyGuard)
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @Policy({ model: 'Menu', action: Action.Read })
  async paginate(@Query() dto: MenuPagerDto) {
    return this.menuService.paginate(dto)
  }

  @Get('all')
  @Policy({ model: 'Menu', action: Action.Read })
  async findAll() {
    return this.menuService.findAll()
  }

  @Get('tree')
  @Policy({ model: 'Menu', action: Action.Read })
  async findTree() {
    return this.menuService.findTree()
  }

  @Get(':id')
  @Policy({ model: 'Menu', action: Action.Read })
  async findOne(@Param() { id }: IdDto) {
    return this.menuService.findOne(id)
  }

  @Post()
  @Policy({ model: 'Menu', action: Action.Create })
  async create(@Body() dto: MenuDto) {
    return this.menuService.create(dto)
  }

  @Put(':id')
  @Policy({ model: 'Menu', action: Action.Update })
  async update(@Param() { id }: IdDto, @Body() dto: MenuUpdateDto) {
    console.log('更新菜单:', id); // 打印普通日志
    console.log('更新菜单:', dto); // 打印普通日志
    return this.menuService.update(id, dto)
  }

  @Delete(':id')
  @Policy({ model: 'Menu', action: Action.Delete })
  async delete(@Param() { id }: IdDto) {
    return this.menuService.delete(id)
  }

  @Delete()
  @Policy({ model: 'Menu', action: Action.Delete })
  async batchDelete(@Body() dto: BatchDeleteDto) {
    const { ids } = dto
    return this.menuService.batchDelete(ids)
  }
}