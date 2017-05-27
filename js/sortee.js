var SORTEE_KEY = "sortee";

class List {
	constructor(name) {
		this.name = name;
		this.nextIndex = 0;
		this.items = [];
		this.relations = [];
	}
	addItemByName(name) {
		var item = new Item(this.nextIndex++, name);
		for (var i = 0; i < this.items.length; i++) {
			var relation = new Relation(this.items[i], item);
			this.relations.push(relation);
		}
		this.items.push(item);
		return item;
	}
	getUnknown() {
		for (var i = 0; i < this.relations.length; i++) {
			if (this.relations[i].isUnknown())
				return this.relations[i];
		}
	}
	unknownCount() {
		var count = 0;
		for (var i = 0; i < this.relations.length; i++) {
			if (this.relations[i].isUnknown()) count++;
		}
		return count;
	}
	resolve(first, second) {
		var upper = first .getUpper(); upper.push(first );
		var lower = second.getLower(); lower.push(second);
		for (var i = 0; i < this.relations.length; i++) {
			var rel = this.relations[i];
			if (rel.isUnknown()) {
				if (upper.includes(rel.a) && lower.includes(rel.b)) {
					rel.setAFirst();
				} else if (lower.includes(rel.a) && upper.includes(rel.b)) {
					rel.setBFirst();
				}
			}
		}
	}
	getOrder() {
		var processed = new Array(this.items.length);
		var order = [];
		var items = this.items;
		function recurse(index) {
			processed[index] = true;
			var upper = items[index].getUpper();
			for (var i = 0; i < upper.length; i++) {
				var nindex = upper[i].index;
				if (!processed[nindex]) {
					recurse(nindex);
				}
			}
			order.push(items[index]);
		}
		for (var i = 0; i < this.items.length; i++) {
			var index = this.items[i].index;
			if (!processed[index]) {
				recurse(index);
			}
		}
		return order;
	}
}
class Item {
	constructor(index, name) {
		this.index = index;
		this.name = name;
		this.relations = [];
	}
	addRelation(rel) {
		this.relations.push(rel);
	}
	getUpper() {
		var upper = [];
		for (var i = 0; i < this.relations.length; i++) {
			if (this.relations[i].second == this)
				upper.push(this.relations[i].first);
		}
		return upper;
	}
	getLower() {
		var lower = [];
		for (var i = 0; i < this.relations.length; i++) {
			if (this.relations[i].first == this)
				lower.push(this.relations[i].second);
		}
		return lower;
	}
}
class Relation {
	constructor(a, b) {
		this.a = a;
		this.b = b;
		this._first = null;
		this._second = null;
		this._ignored = false;

		a.addRelation(this);
		b.addRelation(this);
	}
	other(item) {
		if (item == this.a) return this.b;
		else return this.a;
	}
	setFirst(item) {
		this._ignored = false;
		this._first = item;
		this._second = this.other(item);
	}
	setAFirst() {
		this.setFirst(this.a);
	}
	setBFirst() {
		this.setFirst(this.b);
	}
	get first() {
		return this._first;
	}
	get second() {
		return this._second;
	}
	ignore() {
		this._ignored = true;
	}
	unignore() {
		this._ignored = false;
	}
	isIgnored() {
		return this._ignored;
	}
	isUnknown() {
		return (!this.isIgnored()) && !this.first;
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
