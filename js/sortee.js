var SORTEE_KEY = "sortee";

class List {
	static fromJSON(str) {
		var obj = JSON.parse(str);
		list = new List();
		for (var k in obj) {
			list[k] = obj[k];
		}
		return list;
	}
	constructor(name) {
		if (arguments.length == 0) {
			// nothing
		} else {
			this.name = name;
			this.items = [];
			this.table = [];
		}
	}
	addItemByName(name) {
		for (var i = 0; i < this.items.length; i++) {
			this.table.push(List.REL_UNKNOWN);
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
			if (p[0] > p[1]) return [p[1], p[0]];
			else return p;
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
			this.setTable([first, second], List.REL_A);
		} else {
			this.setTable([first, second], List.REL_B);
		}
	}
	isKnown(p) {
		var t = this.getTable(p);
		return t == List.REL_A || t == List.REL_B;
	}
	isUnknown(p) {
		return this.getTable(p) == List.REL_UNKNOWN;
	}
	isAFirst(p) {
		return this.getTable(p) == List.REL_A;
	}
	isBFirst(p) {
		return this.getTable(p) == List.REL_B;
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
	getWiseUnknown() {
		var rel = this.getUnknown();
		if (rel == undefined) return undefined;
		var stat = rel[0];
		var dynamic = rel[1];
		var targets = [];
		for (var i = 0; i < this.items.length; i++) {
			if (i == dynamic) continue;
			if (i == stat || (this.isKnown([i, stat]) && this.isUnknown([i, dynamic]))) {
				targets.push(i);
			}
		}
		var order = this.getOrder(targets);
		console.log({stat:stat, dynamic:dynamic, targets:targets, order:order});
		var half = order[Math.floor((order.length-1)/2)];
		return this.toAB([dynamic, half]);
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
	getUpperWith(item) {
		var upper = this.getUpper(item);
		upper.push(item);
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
	getLowerWith(item) {
		var lower = this.getLower(item);
		lower.push(item);
		return lower;
	}
	resolve(first, second) {
		var upper = this.getUpperWith(first);
		var lower = this.getLowerWith(second);
		for (var i = 0; i < upper.length; i++) {
			for (var j = 0; j < lower.length; j++) {
				this.setFirstSecond(upper[i], lower[j]);
			}
		}
	}
	getOrder(subset) {
		if (subset) {
			var filter = new Array(this.items.length);
			for (var i = 0; i < subset.length; i++) {
				filter[subset[i]] = true;
			}
		}
		var processed = new Array(this.items.length);
		var order = [];
		var tthis = this;
		function recurse(item) {
			if (processed[item] || (subset && !filter[item])) return;
			processed[item] = true;
			var upper = tthis.getUpper(item);
			for (var i = 0; i < upper.length; i++) {
				recurse(upper[i]);
			}
			order.push(item);
		}
		for (var i = 0; i < this.items.length; i++) {
			recurse(i);
		}
		return order;
	}
}
List.REL_A = 0;
List.REL_B = 1;
List.REL_UNKNOWN = 2;


function loadLocal() {
	if (localStorage.getItem(SORTEE_KEY)) {
		window.sortee = JSON.parse(localStorage.getItem(SORTEE_KEY));
	} else {
		loadDefault();
	}
	window.list = undefined;
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
			$("select.list-items").append("<option>" + window.list.items[i] + "</option>");
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
