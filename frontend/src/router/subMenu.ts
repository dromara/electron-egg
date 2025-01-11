// 子菜单

export interface MenuItem {
  icon: string;
  title: string;
  pageName: string;
  params: Record<string, any>;
}

export interface MenuCategory {
  [key: string]: MenuItem;
}

export interface MenuStructure {
  framework: MenuCategory;
  os: MenuCategory;
  effect: MenuCategory;
  cross: MenuCategory;
}

export const subMenu: MenuStructure = {
	framework: {
		'menu_100' : {
			icon: 'profile',
			title: '通信',
			pageName: 'FrameworkSocketIpc',
			params: {}
		},
		'menu_101' : {
			icon: 'profile',
			title: 'http服务',
			pageName: 'FrameworkSocketHttpServer',
			params: {}
		},
		'menu_102' : {
			icon: 'profile',
			title: 'socket服务',
			pageName: 'FrameworkSocketSocketServer',
			params: {}
		},    
		'menu_104' : {
			icon: 'profile',
			title: 'sqlite数据库',
			pageName: 'FrameworkSqliteDBIndex',
			params: {}
		},
		'menu_105' : {
			icon: 'profile',
			title: '任务',
			pageName: 'FrameworkJobsIndex',
			params: {}
		},				  
		'menu_106' : {
			icon: 'profile',
			title: '软件调用',
			pageName: 'FrameworkSoftwareIndex',
			params: {}
		},	
    'menu_107' : {
			icon: 'profile',
			title: '自动更新',
			pageName: 'FrameworkUpdaterIndex',
			params: {}
		},    	                                           
	},	
  os: {
    'menu_100' : {
        icon: 'profile',
        title: '文件',
        pageName: 'OsFileIndex',
        params: {}
    },
    'menu_102' : {
        icon: 'profile',
        title: '窗口',
        pageName: 'OsWindowIndex',
        params: {}
    },
    'menu_103' : {
        icon: 'profile',
        title: '桌面通知',
        pageName: 'OsNotificationIndex',
        params: {}
    },
    'menu_110' : {
        icon: 'profile',
        title: '图片',
        pageName: 'OsFilePic',
        params: {}
    }, 
  },  
  effect: {
    'menu_100' : {
      icon: 'profile',
      title: '登录',
      pageName: 'EffectLoginIndex',
      params: {}
    }                                                
  },
  cross: {
    'menu_100' : {
      icon: 'profile',
      title: 'go服务',
      pageName: 'CrossGoIndex',
      params: {}
    },
    'menu_110' : {
      icon: 'profile',
      title: 'java服务',
      pageName: 'CrossJavaIndex',
      params: {}
    },
    'menu_120' : {
      icon: 'profile',
      title: 'python服务',
      pageName: 'CrossPythonIndex',
      params: {}
    },                                            
  },
}