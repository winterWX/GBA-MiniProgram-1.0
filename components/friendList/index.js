Component({
	properties: {
		// 数据源
		listData: {
			type: Array,
			value: [],
			observer: "dataChange"
		},
		// 顶部高度
		topSize: {
			type: Number,
			value: 0,
			observer: "dataChange"
		},
		// 底部高度
		bottomSize: {
			type: Number,
			value: 0,
			observer: "dataChange"
		},
		bottomHight: {
			type: Number,
			value: 0,
			observer: "dataChange"
		},
		// 颜色
		color: {
			type: String,
			value: ""
		},
		// 空状态的文字提示
		emptyText: {
			type: String,
			value: ""
		},
		// 控制空状态的显示
		emptyShow: {
			type: Boolean,
			value: false,
		},
	},
	data: {
		/* 未渲染数据 */
		platform: '', // 平台信息
		remScale: 1, // 缩放比例
		realTopSize: 0, // 计算后顶部高度实际值
		realBottomSize: 0, // 计算后底部高度实际值
		colors: [], // 色值数组
		treeInfo: { // 索引树节点信息
			treeTop: 0,
			treeBottom: 0,
			itemHeight: 0,
			itemMount: 0
		},
		indicatorTopList: [], // 指示器节点信息列表
		maxScrollTop: 0, // 最大滚动高度
		blocks: [], // 节点组信息

		/* 渲染数据 */
		list: [], // 处理后数据
		treeItemCur: 0, // 索引树的聚焦项
		listItemCur: 0, // 节点树的聚焦项
		touching: false, // 是否在触摸索引树中
		scrollTop: 0, // 节点树滚动高度
		indicatorTop: -1, // 指示器顶部距离
		treeKeyTran: false,
		style1: "",
		style2: ""
	},
	methods: {
		/**
		 * 点击每一项后触发事件
		 */
		itemClick(e) {
			let {i, j} = e.currentTarget.dataset;
			let data = this.data.list[i].data[j];
			this.triggerEvent('click', data);
		},
		/**
		 * scroll-view 滚动监听
		 */
		scroll(e) {
			if (this.data.touching) return;

			let scrollTop = e.detail.scrollTop;
			if (scrollTop > this.data.maxScrollTop) return;

			let blocks = this.data.blocks,
				stickyTitleHeight = this.data.remScale * 30;

			for (let i = blocks.length - 1; i >= 0; i--) {
				let block = blocks[i];
				// 判断当前滚动值 scrollTop 所在区间, 以得到当前聚焦项
				if (scrollTop >= block.itemTop && scrollTop < block.itemBottom) {
					// 判断当前滚动值 scrollTop 是否在当前聚焦项底一个 .block__title 高度范围内, 如果是则开启过度色值计算
					if (scrollTop > block.itemBottom - stickyTitleHeight) {
						let percent = Math.floor(((scrollTop - (block.itemBottom - stickyTitleHeight)) / stickyTitleHeight) * 100);
						let style1 = `background: rgba(237, 237, 237, ${percent}%);color: ${this.data.colors[percent]}`;
						let style2 = `background: rgba(237, 237, 237, ${100 - percent}%);color: ${this.data.colors[100 - percent]}`;
						this.setData({
							style1: style1,
							style2: style2,
							treeItemCur: i,
							listItemCur: i
						});
					} else if (scrollTop <= block.itemBottom - stickyTitleHeight) {
						this.setData({
							style1: "",
							style2: "",
							treeItemCur: i,
							listItemCur: i
						});
					}
					break;
				}
			}
		},
		/**
		 * 清除参数
		 */
		clearData() {
			this.setData({
				treeItemCur: 0,  // 索引树的聚焦项
				listItemCur: 0,  // 节点树的聚焦项
				touching: false,  // 是否在触摸索引树中
				scrollTop: 0,   // 节点树滚动高度
				indicatorTop: -1,   // 指示器顶部距离
				treeKeyTran: false,
				style1: "",
				style2: ""
			});
		},
		/**
		 * 监听数据变化, 如果改变重新初始化参数
		 */
		dataChange(newVal, oldVal) {
			this.init();
		},
		/**
		 *  初始化获取 dom 信息
		 */
		initDom() {
			let {windowHeight, windowWidth, platform} = wx.getSystemInfoSync();
			let remScale = (windowWidth || 375) / 375,
				realTopSize = this.data.topSize * remScale / 2,
				realBottomSize = this.data.bottomSize * remScale / 2;
				//colors = ColorUtil.gradient(this.data.color, "#767676", 100);

			this.setData({
				platform: platform,
				remScale: remScale,
				realTopSize: realTopSize,
				realBottomSize: realBottomSize
			});
		},
		/**
		 *  初始化
		 */
		init() {
			this.clearData();
			// 避免获取不到节点信息报错问题
			if (this.data.listData.length === 0) {
				this.setData({list: []});
				return;
			}
			let list = this.data.listData.map((item, index) => {
				item.data = item.data.map((chItem, chIndex) => {
					return {
						firstChar: chItem.name.slice(0, 1),
						...chItem
					}
				});
				return item;
			});
			this.setData({list: list});
			// 异步加载数据时候, 延迟执行 initDom 方法, 防止基础库 2.7.1 版本及以下无法正确获取 dom 信息
			setTimeout(() => this.initDom(), 10);
		},
	},
	ready() {
		this.init();
	}
});
