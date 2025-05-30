declare namespace API {
  // 菜单项
  type MenuItem = {
    id: string;
    name: string;
    path?: string;
    icon?: string;
    component?: string;
    sort: number;
    hidden: boolean;
    status: boolean;
    permissions?: string;
    parentId?: string;
    level: number;
    path_ids: string[];
    path_names: string[];
    createdAt: string;
    updatedAt: string;
  };

  // 菜单树节点
  type MenuTreeItem = MenuItem & {
    children: MenuTreeItem[];
  };

  // 菜单分页列表
  type MenuList = {
    items: MenuItem[];
    meta: {
      totalCount: number;
      page: number;
      limit: number;
    };
  };
}
