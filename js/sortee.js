var SORTEE_KEY = "sortee";

class List {
	constructor(name) {
		this.name = name;
		this.items = [];
		this.table = [];

		this.REL_A = 0;
		this.REL_B = 1;
		this.REL_UNKNOWN = 2;
	}
	addItemByName(name) {
		for (var i = 0; i < this.items.length; i++) {
			this.table.push(this.REL_UNKNOWN);
		}
		this.items.push(name);
		return this.items.length - 1;
	}
	convertTableIndex(p) {
		if (Array.isArray(p)) {
			var a = Math.min(p[0], p[1]);
			var b = Math.max(p[0], p[1]);
			var index = b * (b-1) / 2 + a;
			return index;
		} else {
			var index = p;
			var b = Math.floor((1+Math.sqrt(1+8*index))/2);
			var a = index - b * (b-1) / 2;
			return [a, b];
		}
	}
	toIndex(p) {
		if (Array.isArray(p)) {
			return this.convertTableIndex(p);
		} else {
			return p;
		}
	}
	toAB(p) {
		if (Array.isArray(p)) {
			return p;
		} else {
			return this.convertTableIndex(p);
		}
	}
	getTable(p) {
		return this.table[this.toIndex(p)];
	}
	setTable(p, rel) {
		this.table[this.toIndex(p)] = rel;
	}
	setFirstSecond(first, second) {
		if (first < second) {
			this.setTable([first, second], this.REL_A);
		} else {
			this.setTable([first, second], this.REL_B);
		}
	}
	isUnknown(p) {
		return this.getTable(p) == this.REL_UNKNOWN;
	}
	isAFirst(p) {
		return this.getTable(p) == this.REL_A;
	}
	isBFirst(p) {
		return this.getTable(p) == this.REL_B;
	}
	contains(p, item) {
		var ab = this.toAB(p);
		return item == ab[0] || item == ab[1];
	}
	isFirst(p, item) {
		var ab = this.toAB(p);
		return (item == ab[0] && this.isAFirst(p, item)) || (item == ab[1] && this.isBFirst(p, item));
	}
	isSecond(p, item) {
		var ab = this.toAB(p);
		return (item == ab[0] && this.isBFirst(p, item)) || (item == ab[1] && this.isAFirst(p, item));
	}
	getUnknown() {
		for (var i = 0; i < this.table.length; i++) {
			if (this.isUnknown(i)) {
				return this.toAB(i);
			}
		}
	}
	unknownCount() {
		var count = 0;
		for (var i = 0; i < this.table.length; i++) {
			if (this.isUnknown(i))
				count++;
		}
		return count;
	}
	getUpper(item) {
		var upper = [];
		for (var i = 0; i < this.items.length; i++) {
			if (item != i && this.isSecond([item, i], item)) {
				upper.push(i);
			}
		}
		return upper;
	}
	getLower(item) {
		var lower = [];
		for (var i = 0; i < this.items.length; i++) {
			if (item != i && this.isFirst([item, i], item)) {
				lower.push(i);
			}
		}
		return lower;
	}
	resolve(first, second) {
		var upper = this.getUpper(first ); upper.push(first );
		var lower = this.getLower(second); lower.push(second);
		for (var i = 0; i < upper.length; i++) {
			for (var j = 0; j < lower.length; j++) {
				this.setFirstSecond(upper[i], lower[j]);
			}
		}
	}
	getOrder() {
		var processed = new Array(this.items.length);
		var order = [];
		var tthis = this;
		function recurse(item) {
			processed[item] = true;
			var upper = tthis.getUpper(item);
			for (var i = 0; i < upper.length; i++) {
				if (!processed[upper[i]]) {
					recurse(upper[i]);
				}
			}
			order.push(item);
		}
		for (var i = 0; i < this.items.length; i++) {
			if (!processed[i]) {
				recurse(i);
			}
		}
		return order;
	}
}


function loadLocal() {
	if (localStorage.getItem(SORTEE_KEY)) {
		window.sortee = JSON.parse(localStorage.getItem(SORTEE_KEY));
	} else {
		loadDefault();
	}
}
function saveLocal() {
	var json = JSON.stringify(window.sortee);
	localStorage.setItem(SORTEE_KEY, json);
}
function loadDefault() {
	window.sortee = {
		lists : {},
	};
}
//===== Lists =====
function createList(name) {
	if (arguments.length == 0) {
		var name = $("#new-list-name").val();
		$("#new-list-name").val("");
	}
	if (!window.sortee.lists[name]) {
		window.sortee.lists[name] = new List(name);
	}
	updateGui();
	saveLocal();
}
function selectList(key) {
	window.list = sortee.lists[key];
	updateList();
}
function removeList() {
	if (window.list) {
		window.sortee.lists[window.list.name] = undefined;
		window.list = undefined;
		updateGui();
		updateList();
		saveLocal();
	}
}
function updateGui() {
	var el = $("#list-local").empty();
	for (var key in window.sortee.lists) {
		if (window.sortee.lists.hasOwnProperty(key) && window.sortee.lists[key]) {
			el.append('<li><a href="#" onclick="selectList(\''+key+'\');">'+key+'</a></li>');
		}
	}
}
function updateList() {
	$("select.list-items").empty();
	if (window.list) {
		$(".list-name").text(window.list.name);
		for (var i = 0; i < window.list.items.length; i++) {
			$("select.list-items").append("<option>" + window.list.items[i].name + "</option>");
		}
	} else {
		$(".list-name").text("No list selected");
	}
}
function reset() {
	loadDefault();
	saveLocal();
	createList("LList");
	selectList("LList");
	addItem("0");
	addItem("1");
	addItem("2");
	addItem("3");
}
function addItem(name) {
	if (arguments.length == 0) {
		var name = $("#new-item-name").val();
		$("#new-item-name").val("");
	}
	window.list.addItemByName(name);
	updateList();
	saveLocal();
}
