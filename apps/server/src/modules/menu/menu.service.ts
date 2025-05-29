import { Injectable } from '@nestjs/common'
import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'
import { MenuDto, MenuPagerDto, MenuUpdateDto } from './menu.dto'

// 添加此导出类型
export type MenuTreeNode = {
  id: string;
  [key: string]: any;
  children: MenuTreeNode[];
}

@Injectable()
export class MenuService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  async paginate({
    page,
    limit,
    sortBy = 'sort',
    sortOrder = 'asc',
    name,
    status,
    parentId,
  }: MenuPagerDto) {
    const where = {
      ...(name ? { name: { contains: name } } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(parentId !== undefined ? { parentId } : {}),
    }

    const [items, meta] = await this.prisma.menu.paginate({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }).withPages({
      page,
      limit,
      includePageCount: true,
    })

    return {
      items,
      meta,
    }
  }

  async findAll() {
    return this.prisma.menu.findMany({
      orderBy: [
        { level: 'asc' },
        { sort: 'asc' },
      ],
    })
  }

  async findTree(): Promise<MenuTreeNode[]> {
    // 获取所有菜单项
    const allMenus = await this.prisma.menu.findMany({
      orderBy: [
        { sort: 'asc' },
      ],
    })

    // 构建树形结构
    const menuMap = new Map<string, MenuTreeNode>()
    const rootMenus: MenuTreeNode[] = []

    // 首先将所有菜单项放入Map中，以id为键
    allMenus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] })
    })

    // 然后构建树形结构
    allMenus.forEach(menu => {
      const menuWithChildren = menuMap.get(menu.id)
      if (!menuWithChildren) return;
      
      if (menu.parentId) {
        const parentMenu = menuMap.get(menu.parentId)
        if (parentMenu) {
          parentMenu.children.push(menuWithChildren)
        } else {
          // 如果找不到父菜单，则作为根菜单处理
          rootMenus.push(menuWithChildren)
        }
      } else {
        // 没有parentId的是根菜单
        rootMenus.push(menuWithChildren)
      }
    })

    return rootMenus
  }

  async findOne(id: string) {
    return this.prisma.menu.findUniqueOrThrow({
      where: { id },
    })
  }

  async create(dto: MenuDto) {
    const { parentId, ...data } = dto

    // 处理物化路径
    let level = 1
    let path_ids: string[] = []
    let path_names: string[] = []

    // 如果有父节点，需要获取父节点信息来构建物化路径
    if (parentId) {
      const parent = await this.prisma.menu.findUniqueOrThrow({
        where: { id: parentId },
      })

      level = parent.level + 1
      path_ids = [...parent.path_ids, parent.id]
      path_names = [...parent.path_names, parent.name]
    }

    return this.prisma.menu.create({
      data: {
        ...data,
        parentId,
        level,
        path_ids,
        path_names,
      },
    })
  }

  async update(id: string, dto: MenuUpdateDto) {
    const { parentId, ...data } = dto

    // 如果更新了parentId，需要重新计算物化路径
    if (parentId !== undefined) {
      let level = 1
      let path_ids: string[] = []
      let path_names: string[] = []

      // 如果有父节点，需要获取父节点信息来构建物化路径
      if (parentId) {
        const parent = await this.prisma.menu.findUniqueOrThrow({
          where: { id: parentId },
        })

        // 检查是否会形成循环引用
        if (parent.path_ids.includes(id)) {
          throw new Error('不能将菜单移动到其子菜单下，这会导致循环引用')
        }

        level = parent.level + 1
        path_ids = [...parent.path_ids, parent.id]
        path_names = [...parent.path_names, parent.name]
      }

      // 更新当前节点
      await this.prisma.menu.update({
        where: { id },
        data: {
          ...data,
          parentId,
          level,
          path_ids,
          path_names,
        },
      })

      // 更新所有子节点的物化路径
      await this.updateChildrenPaths(id)

      return this.findOne(id)
    }

    // 如果没有更新parentId，只需要更新其他字段
    return this.prisma.menu.update({
      where: { id },
      data,
    })
  }

  // 递归更新所有子节点的物化路径
  private async updateChildrenPaths(parentId: string) {
    // 获取父节点
    const parent = await this.prisma.menu.findUniqueOrThrow({
      where: { id: parentId },
    })

    // 获取所有直接子节点
    const children = await this.prisma.menu.findMany({
      where: { parentId },
    })

    // 更新每个子节点
    for (const child of children) {
      const level = parent.level + 1
      const path_ids = [...parent.path_ids, parent.id]
      const path_names = [...parent.path_names, parent.name]

      await this.prisma.menu.update({
        where: { id: child.id },
        data: {
          level,
          path_ids,
          path_names,
        },
      })

      // 递归更新子节点的子节点
      await this.updateChildrenPaths(child.id)
    }
  }

  async delete(id: string) {
    // 检查是否有子菜单
    const childCount = await this.prisma.menu.count({
      where: { parentId: id },
    })

    if (childCount > 0) {
      throw new Error('该菜单下有子菜单，不能直接删除')
    }

    return this.prisma.menu.delete({
      where: { id },
    })
  }

  async batchDelete(ids: string[]) {
    // 检查每个ID是否有子菜单
    for (const id of ids) {
      const childCount = await this.prisma.menu.count({
        where: { parentId: id },
      })

      if (childCount > 0) {
        throw new Error(`菜单ID ${id} 下有子菜单，不能直接删除`)
      }
    }

    return this.prisma.menu.deleteMany({
      where: {
        id: { in: ids },
      },
    })
  }
}