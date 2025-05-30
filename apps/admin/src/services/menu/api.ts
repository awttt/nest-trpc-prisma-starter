import { request } from '@umijs/max';

import { IBaseResponse } from '@server/common/model/response.model';
import { MenuDto, MenuUpdateDto } from '@server/modules/menu/menu.dto';

// 获取菜单分页数据
export async function queryMenu(
  params: {
    current?: number;
    pageSize?: number;
    name?: string;
    status?: boolean;
    parentId?: string;
  },
  options?: { [key: string]: any },
) {
  const result = await request<IBaseResponse<API.MenuList>>('/api/menus', {
    method: 'GET',
    params: {
      ...params,
      page: params.current,
      limit: params.pageSize,
    },
    ...(options || {}),
  });

  return {
    success: result.ok,
    data: result.data?.items,
    total: result.data?.meta.totalCount,
  };
}

// 获取所有菜单
export async function getAllMenus() {
  return request<IBaseResponse<API.MenuItem[]>>('/api/menus/all', {
    method: 'GET',
  });
}

// 获取菜单树
export async function getMenuTree() {
  return request<IBaseResponse<API.MenuTreeItem[]>>('/api/menus/tree', {
    method: 'GET',
  });
}

// 获取单个菜单
export async function getMenu(id: string) {
  return request<IBaseResponse<API.MenuItem>>(`/api/menus/${id}`, {
    method: 'GET',
  });
}

// 添加菜单
export async function addMenu(data: MenuDto) {
  return request<IBaseResponse<API.MenuItem>>(`/api/menus`, {
    method: 'POST',
    data,
  });
}

// 更新菜单
export async function updateMenu(id: string, data: MenuUpdateDto) {
  return request<IBaseResponse<API.MenuItem>>(`/api/menus/${id}`, {
    method: 'PUT',
    data,
  });
}

// 删除菜单
export async function removeMenu(id: string) {
  return request<IBaseResponse<any>>(`/api/menus/${id}`, {
    method: 'DELETE',
  });
}

// 批量删除菜单
export async function batchRemoveMenu(ids: string[]) {
  return request('/api/menus', {
    method: 'DELETE',
    data: { ids },
  });
}
