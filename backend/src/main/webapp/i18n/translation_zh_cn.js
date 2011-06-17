/**
 * @author sven.wagner-boysen
 * 
 * contains all strings for default language (en_us)
 * 
 */



// namespace
if(window.Repository == undefined) Repository = {};
if(window.Repository.I18N == undefined) Repository.I18N = {};

Repository.I18N.Language = "zh_cn";


Repository.I18N.en_us = "English";
Repository.I18N.de = "Deutsch";
Repository.I18N.ru = "Русский";
Repository.I18N.es = "español";

// Repository strings

if(!Repository.I18N.Repository) Repository.I18N.Repository = {};

Repository.I18N.Repository.openIdSample = "你的openID";
Repository.I18N.Repository.sayHello = "Hi";
Repository.I18N.Repository.login = "登录";
Repository.I18N.Repository.logout = "注销";

Repository.I18N.Repository.viewMenu = "视图";
Repository.I18N.Repository.viewMenuTooltip = "改变视图";

Repository.I18N.Repository.windowTimeoutMessage = "The editor does not seem to be started yet. Please check, whether you have a popup blocker enabled and disable it or allow popups for this site. We will never display any commercials on this site.";
Repository.I18N.Repository.windowTitle = "Oryx流程设计器";

Repository.I18N.Repository.noSaveTitle = "消息";
Repository.I18N.Repository.noSaveMessage = "As a public user, you can not save a model. Do you want to model anyway?";
Repository.I18N.Repository.yes = "确定";
Repository.I18N.Repository.no = "取消";

Repository.I18N.Repository.leftPanelTitle = "流程模型";
Repository.I18N.Repository.rightPanelTitle = "模型信息";
Repository.I18N.Repository.bottomPanelTitle = "模型说明";

Repository.I18N.Repository.loadingText = "正在加载..."

Repository.I18N.Repository.errorText = "<b style='font-size:13px'>Upps!</b><br/>Diagrams can only be edited with a <a href='http://www.mozilla.com/en-US/products/firefox/' target='_blank'>Firefox Browser</a>.";
Repository.I18N.Repository.errorAuthor = "Author:"
Repository.I18N.Repository.errorTitle = "Title:"
// Plugin strings
 
// NewModel Plugin
if(!Repository.I18N.NewModel) Repository.I18N.NewModel = {};

Repository.I18N.NewModel.name = "设计流程";
Repository.I18N.NewModel.tooltipText = "创建选定类型的流程模型";

// TableView Plugin

if(!Repository.I18N.TableView) Repository.I18N.TableView = {};
Repository.I18N.TableView.name = "网格";

if(!Repository.I18N.TableView.columns) Repository.I18N.TableView.columns = {};
Repository.I18N.TableView.columns.title = "名称";
Repository.I18N.TableView.columns.type = "模型类型";
Repository.I18N.TableView.columns.author = "创建人";
Repository.I18N.TableView.columns.summary = "说明";
Repository.I18N.TableView.columns.creationDate = "创建日期";
Repository.I18N.TableView.columns.lastUpdate = "更新日期";
Repository.I18N.TableView.columns.id = "编号";

if(!Repository.I18N.IconView) Repository.I18N.IconView = {};
Repository.I18N.IconView.name = "图标";


if(!Repository.I18N.FullView) Repository.I18N.FullView = {};
Repository.I18N.FullView.name = "所有";

Repository.I18N.FullView.createdLabel = "创建于";
Repository.I18N.FullView.fromLabel = "创建人";
Repository.I18N.FullView.changeLabel = "更新时间";
Repository.I18N.FullView.descriptionLabel = "说明";
Repository.I18N.FullView.editorLabel = "打开编辑";
;
// TypeFilter Plugin

if(!Repository.I18N.TypeFilter) Repository.I18N.TypeFilter = {};
Repository.I18N.TypeFilter.name = "按类型过滤";

// TagFilter Plugin

if(!Repository.I18N.TagFilter) Repository.I18N.TagFilter = {};
Repository.I18N.TagFilter.name = "Tag Filter";

// Friend Filter Plugin

if(!Repository.I18N.FriendFilter) Repository.I18N.FriendFilter = {};
Repository.I18N.FriendFilter.name = "Friend Filter";

if(!Repository.I18N.TagInfo) Repository.I18N.TagInfo = {};
Repository.I18N.TagInfo.name = "Tags"
Repository.I18N.TagInfo.deleteText = "Delete"
Repository.I18N.TagInfo.none = "none"
Repository.I18N.TagInfo.shared = "Shared tags:"
Repository.I18N.TagInfo.newTag = "New Tag"
Repository.I18N.TagInfo.addTag = "Add"
		
if(!Repository.I18N.ModelRangeSelection) Repository.I18N.ModelRangeSelection = {};
Repository.I18N.ModelRangeSelection.previous = "« 前一页"
Repository.I18N.ModelRangeSelection.next = "下一页 »"
Repository.I18N.ModelRangeSelection.nextSmall = "»"
Repository.I18N.ModelRangeSelection.previousSmall = "«"
Repository.I18N.ModelRangeSelection.last = "末页"
Repository.I18N.ModelRangeSelection.first = "首页"
Repository.I18N.ModelRangeSelection.modelsOfZero = "(0 模型)" 
Repository.I18N.ModelRangeSelection.modelsOfOne = "(#{from} from #{size} models)" 
Repository.I18N.ModelRangeSelection.modelsOfMore = "(#{from}-#{to} from #{size} models)" 

if(!Repository.I18N.AccessInfo) Repository.I18N.AccessInfo = {};
Repository.I18N.AccessInfo.name = "Access Rights"
Repository.I18N.AccessInfo.publicText = "Public";
Repository.I18N.AccessInfo.notPublicText  = "Not Public";
Repository.I18N.AccessInfo.noneIsSelected  = "None is selected";
Repository.I18N.AccessInfo.none  = "none";
Repository.I18N.AccessInfo.deleteText  = "Delete";
Repository.I18N.AccessInfo.publish  = "Publishing";
Repository.I18N.AccessInfo.unPublish  = "Stop Publishing";
Repository.I18N.AccessInfo.owner = "Owner:"
Repository.I18N.AccessInfo.contributer = "Contributers:"
Repository.I18N.AccessInfo.reader = "Readers:"
Repository.I18N.AccessInfo.openid = "OpenID"
Repository.I18N.AccessInfo.addReader = "Add as Reader"
Repository.I18N.AccessInfo.addContributer = "Add as Contributer"
Repository.I18N.AccessInfo.several = "several"
Repository.I18N.AccessInfo.noWritePermission = "No write permissions"
 

if(!Repository.I18N.SortingSupport) Repository.I18N.SortingSupport = {};
Repository.I18N.SortingSupport.name = "排序";
Repository.I18N.SortingSupport.lastchange = "修改时间"
Repository.I18N.SortingSupport.title = "名称"
Repository.I18N.SortingSupport.rating = "By rating"

if(!Repository.I18N.Export) Repository.I18N.Export = {};
Repository.I18N.Export.name = "导出";
Repository.I18N.Export.title = "支持的导出类型:"
Repository.I18N.Export.onlyOne = "请选择一个流程模型!"

if(!Repository.I18N.UpdateButton) Repository.I18N.UpdateButton = {};
Repository.I18N.UpdateButton.name = "刷新"

if(!Repository.I18N.Edit) Repository.I18N.Edit = {};
Repository.I18N.Edit.name = "编辑"
Repository.I18N.Edit.editSummary = "说明"
Repository.I18N.Edit.editName = "名称"
Repository.I18N.Edit.nameText = "名称"
Repository.I18N.Edit.summaryText = "说明"
Repository.I18N.Edit.editText = "保存"
Repository.I18N.Edit.deleteText = "删除"
Repository.I18N.Edit.noWriteAccess = "只有创建人可以删除"
Repository.I18N.Edit.deleteOneText = "'#{名称}'" 
Repository.I18N.Edit.deleteMoreText = "All #{size} selected models" 


if(!Repository.I18N.Rating) Repository.I18N.Rating = {};
Repository.I18N.Rating.name = "Rating"
Repository.I18N.Rating.total = "Total Rating:"
Repository.I18N.Rating.my = "My Rating:"
Repository.I18N.Rating.totalNoneText = "no votes" 
Repository.I18N.Rating.totalOneText = "#{totalScore} (#{totalVotes})" 
Repository.I18N.Rating.totalMoreText = "From  #{modelCount} are #{voteCount} voted in average with #{totalScore} (#{totalVotes})"

if(!Repository.I18N.RatingFilter) Repository.I18N.RatingFilter = {};
Repository.I18N.RatingFilter.name = "Rating Filter"

if(!Repository.I18N.AccessFilter) Repository.I18N.AccessFilter = {};
Repository.I18N.AccessFilter.name = "Access Filter"
Repository.I18N.AccessFilter.mine = "Mine"
Repository.I18N.AccessFilter.reader = "Me as a reader"
Repository.I18N.AccessFilter.writer = "Me as a writer"
Repository.I18N.AccessFilter.publicText = "Public"
