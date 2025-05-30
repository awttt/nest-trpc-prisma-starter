import {
  addMenu,
  batchRemoveMenu,
  getAllMenus,
  getMenuTree,
  queryMenu,
  removeMenu,
  updateMenu,
} from '@/services/menu/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, message, Modal, Switch, Tag, Tree } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

// 处理菜单状态变更
const handleStatusChange = async (checked: boolean, record: API.MenuItem) => {
  const hide = message.loading('更新中...');
  try {
    await updateMenu(record.id, {
      status: checked,
    });
    hide();
    message.success('状态更新成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

// 添加菜单
const handleAdd = async (fields: any) => {
  const hide = message.loading('正在添加...');
  try {
    await addMenu({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

// 更新菜单
const handleUpdate = async ({ id, ...fields }: any) => {
  const hide = message.loading('更新中...');
  try {
    await updateMenu(id, {
      ...fields,
    });
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

// 删除菜单
const handleRemove = async (id: string) => {
  const hide = message.loading('正在删除...');
  try {
    await removeMenu(id);
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，该菜单可能有子菜单');
    return false;
  }
};

// 批量删除菜单
const handleBatchRemove = async (selectedRows: API.MenuItem[]) => {
  const hide = message.loading('正在删除...');
  if (!selectedRows) return true;
  try {
    await batchRemoveMenu(selectedRows.map((row) => row.id));
    hide();
    message.success('批量删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('批量删除失败，选中的菜单中可能有子菜单');
    return false;
  }
};

const MenuList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [treeVisible, setTreeVisible] = useState<boolean>(false);
  const [menuTree, setMenuTree] = useState<API.MenuTreeItem[]>([]);
  const [parentMenus, setParentMenus] = useState<API.MenuItem[]>([]);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const updateFormRef = useRef<ProFormInstance>();
  const [currentRow, setCurrentRow] = useState<API.MenuItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.MenuItem[]>([]);

  // 加载菜单树
  const loadMenuTree = async () => {
    try {
      const result = await getMenuTree();
      if (result.ok) {
        setMenuTree(result.data || []);
      }
    } catch (error) {
      console.error('加载菜单树失败:', error);
    }
  };

  // 加载所有菜单（用于父菜单选择）
  const loadAllMenus = async () => {
    try {
      const result = await getAllMenus();
      if (result.ok) {
        setParentMenus(result.data || []);
      }
    } catch (error) {
      console.error('加载所有菜单失败:', error);
    }
  };

  useEffect(() => {
    loadMenuTree();
    loadAllMenus();
  }, []);

  // 将菜单数据转换为树形选择数据
  const convertToTreeSelect = (menus: API.MenuItem[]): any[] => {
    return menus.map((menu) => ({
      label: menu.name,
      value: menu.id,
      disabled:
        currentRow?.id === menu.id ||
        (currentRow?.path_ids && currentRow.path_ids.includes(menu.id)),
    }));
  };

  // 将菜单树转换为Tree组件数据
  const convertToTreeData = (menus: API.MenuTreeItem[]): any[] => {
    return menus.map((menu) => ({
      title: (
        <span>
          {menu.icon && <span className="anticon">{menu.icon}</span>}
          {menu.name}
          {!menu.status && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              禁用
            </Tag>
          )}
        </span>
      ),
      key: menu.id,
      children: menu.children?.length > 0 ? convertToTreeData(menu.children) : undefined,
    }));
  };

  // 表格列定义
  const columns: ProColumns<API.MenuItem>[] = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      width: 180,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '路径',
      dataIndex: 'path',
      width: 180,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '组件',
      dataIndex: 'component',
      width: 180,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      align: 'center',
    },
    {
      title: '层级',
      dataIndex: 'level',
      width: 80,
      align: 'center',
    },
    {
      title: '隐藏',
      dataIndex: 'hidden',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tag color={record.hidden ? 'orange' : 'green'}>{record.hidden ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.status}
          size="small"
          onChange={(checked) => {
            handleStatusChange(checked, record).then(() => {
              actionRef.current?.reload();
              loadMenuTree();
            });
          }}
        />
      ),
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_, record) => [
        <Button
          key="update"
          type="link"
          size="small"
          onClick={() => {
            setCurrentRow(record);
            handleUpdateModalOpen(true);
            // 设置表单初始值
            setTimeout(() => {
              updateFormRef.current?.setFieldsValue({
                ...record,
              });
            }, 100);
          }}
        >
          编辑
        </Button>,
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          onClick={() => {
            Modal.confirm({
              title: '确定删除该菜单吗?',
              content: '删除后不可恢复',
              onOk: async () => {
                const success = await handleRemove(record.id);
                if (success) {
                  actionRef.current?.reload();
                  loadMenuTree();
                  loadAllMenus();
                }
              },
            });
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer
      header={{
        title: '菜单管理',
        extra: [
          <Button key="tree" onClick={() => setTreeVisible(true)}>
            树形视图
          </Button>,
        ],
      }}
    >
      <ProTable<API.MenuItem, API.PageParams>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={queryMenu}
        columns={columns}
        scroll={{ x: 1300 }}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        pagination={{
          defaultPageSize: 10,
        }}
        form={{
          initialValues: {
            sortBy: 'sort',
            sortOrder: 'asc',
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项
            </div>
          }
        >
          <Button
            onClick={async () => {
              Modal.confirm({
                title: '确定批量删除选中的菜单吗?',
                content: '删除后不可恢复',
                onOk: async () => {
                  const success = await handleBatchRemove(selectedRowsState);
                  if (success) {
                    setSelectedRows([]);
                    actionRef.current?.reloadAndRest?.();
                    loadMenuTree();
                    loadAllMenus();
                  }
                },
              });
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      {/* 新建菜单弹窗 */}
      <ModalForm
        title="新建菜单"
        width="550px"
        formRef={formRef}
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value);
          if (success) {
            handleModalOpen(false);
            formRef.current?.resetFields();
            actionRef.current?.reload();
            loadMenuTree();
            loadAllMenus();
          }
        }}
      >
        <ProFormText
          name="name"
          label="菜单名称"
          rules={[
            {
              required: true,
              message: '请输入菜单名称',
            },
          ]}
        />
        <ProFormText name="path" label="路径" placeholder="/system/menu" />
        <ProFormText name="icon" label="图标" placeholder="例如: user" />
        <ProFormText name="component" label="组件" placeholder="例如: ./system/menu" />
        <ProFormDigit
          name="sort"
          label="排序"
          initialValue={0}
          min={0}
          rules={[
            {
              required: true,
              message: '请输入排序值',
            },
          ]}
        />
        <ProFormText name="permissions" label="权限标识" placeholder="例如: system:menu:list" />
        <ProFormSelect
          name="parentId"
          label="父级菜单"
          allowClear
          options={convertToTreeSelect(parentMenus)}
          placeholder="不选择则为顶级菜单"
        />
        <ProFormSwitch name="hidden" label="是否隐藏" initialValue={false} />
        <ProFormSwitch name="status" label="状态" initialValue={true} />
      </ModalForm>

      {/* 编辑菜单弹窗 */}
      <ModalForm
        title="编辑菜单"
        width="550px"
        formRef={updateFormRef}
        open={updateModalOpen}
        onOpenChange={handleUpdateModalOpen}
        onFinish={async (value) => {
          const success = await handleUpdate({
            id: currentRow?.id,
            ...value,
          });
          if (success) {
            handleUpdateModalOpen(false);
            actionRef.current?.reload();
            loadMenuTree();
            loadAllMenus();
          }
        }}
      >
        <ProFormText
          name="name"
          label="菜单名称"
          rules={[
            {
              required: true,
              message: '请输入菜单名称',
            },
          ]}
        />
        <ProFormText name="path" label="路径" placeholder="/system/menu" />
        <ProFormText name="icon" label="图标" placeholder="例如: user" />
        <ProFormText name="component" label="组件" placeholder="例如: ./system/menu" />
        <ProFormDigit
          name="sort"
          label="排序"
          min={0}
          rules={[
            {
              required: true,
              message: '请输入排序值',
            },
          ]}
        />
        <ProFormText name="permissions" label="权限标识" placeholder="例如: system:menu:list" />
        <ProFormSelect
          name="parentId"
          label="父级菜单"
          allowClear
          options={convertToTreeSelect(parentMenus)}
          placeholder="不选择则为顶级菜单"
        />
        <ProFormSwitch name="hidden" label="是否隐藏" />
        <ProFormSwitch name="status" label="状态" />
      </ModalForm>

      {/* 树形视图弹窗 */}
      <Modal
        title="菜单树形结构"
        open={treeVisible}
        onCancel={() => setTreeVisible(false)}
        footer={null}
        width={600}
      >
        <Tree
          defaultExpandAll
          showLine={{ showLeafIcon: false }}
          treeData={convertToTreeData(menuTree)}
        />
      </Modal>
    </PageContainer>
  );
};

export default MenuList;
