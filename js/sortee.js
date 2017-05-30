var SORTEE_KEY = "sortee";

class List {
	static fromJSON(str) {
		var obj = JSON.parse(str);
		return List.fromObject(obj);
	}
	static fromObject(obj) {
		var list = new List();
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
		this.history = [];
	}
	createMemento() {
		var mem = {
			items: this.items.slice(),
			table: this.table.slice()
		};
		return mem;
	}
	restoreMemento(mem) {
		this.items = mem.items;
		this.table = mem.table;
	}
	canUndo() {
		return this.history.length >= 1;
	}
	saveState() {
		this.history.push(this.createMemento());
	}
	undo() {
		if (this.canUndo()) {
			this.restoreMemento(this.history.pop());
		}
	}
	createFilter(set) {
		var filter = new Array(this.items.length);
		for (var i = 0; i < set.length; i++) {
			filter[set[i]] = true;
		}
		return filter;
	}
	addItemByName(name) {
		for (var i = 0; i < this.items.length; i++) {
			this.table.push(List.REL_UNKNOWN);
		}
		this.items.push(name);
		return this.items.length - 1;
	}
	removeItems(toRemove) {
		if (!Array.isArray(toRemove)) {
			toRemove = [toRemove];
		}
		var items_filter = this.createFilter(toRemove);
		var items_new = [];
		for (var i = 0; i < this.items.length; i++) {
			if (!items_filter[i]) {
				items_new.push(this.items[i]);
			}
		}
		var table_new = [];
		for (var i = 0; i < this.table.length; i++) {
			var ab = this.toAB(i);
			if (!items_filter[ab[0]] && !items_filter[ab[1]]) {
				table_new.push(this.table[i]);
			}
		}
		this.items = items_new;
		this.table = table_new;
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
			var filter = this.createFilter(subset);
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
	flushOrder() {
		for (var i = 0; i < this.table.length; i++) {
			this.table[i] = List.REL_UNKNOWN;
		}
	}
	toJSON() {
		return {
			name: this.name,
			items: this.items,
			table: this.table
		};
	}
}
List.REL_A = 0;
List.REL_B = 1;
List.REL_UNKNOWN = 2;


function loadLocal() {
	loadDefault();
	if (localStorage.getItem(SORTEE_KEY)) {
		var parsed = JSON.parse(localStorage.getItem(SORTEE_KEY));
		for (var k in parsed.lists) {
			window.sortee.lists[k] = List.fromObject(parsed.lists[k]);
		}
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
	if (name.length == 0) return;
	if (!window.sortee.lists[name]) {
		window.sortee.lists[name] = new List(name);
	}
	updateGui();
	saveLocal();
}
function selectList(el, key) {
	$(".lists-buttons a").removeClass("active");
	$(el).addClass("active");
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
function removeItems() {
	if (window.list) {
		window.list.saveState();
		var toRemove = [];
		$("#list-items-selection :selected").each(function(i, el) {
			toRemove.push(parseInt($(el).val()));
		});
		window.list.removeItems(toRemove);
		updateList();
		saveLocal();
	}
}
function removeOrder() {
	if (window.list) {
		window.list.saveState();
		window.list.flushOrder();
		updateList();
		saveLocal();
	}
}
function updateGui() {
	var el = $(".lists-buttons").empty();
	for (var key in window.sortee.lists) {
		if (window.sortee.lists.hasOwnProperty(key) && window.sortee.lists[key]) {
			el.append('<a href="#" class="list-group-item" onclick="selectList(this, \''+key+'\');">'+key+'</a>');
		}
	}
}
function updateList() {
	$("select.list-items").empty();
	if (window.list) {
		$(".list-name").text(window.list.name);
		var order = window.list.getOrder();
		for (var i = 0; i < order.length; i++) {
			$("select.list-items").append("<option value=\"" + order[i] + "\">" + window.list.items[order[i]] + "</option>");
		}
		$(".list-action").prop('disabled', false);
		var count = window.list.unknownCount();
		$(".list-unknown").text(count);
		if (count >= 1) {
			window.question = window.list.getWiseUnknown();
			$(".question .item-a").text(window.list.items[window.question[0]]);
			$(".question .item-b").text(window.list.items[window.question[1]]);
		} else {
			$(".question .list-action").prop('disabled', true);
			$(".question .item").text("");
		}
		if (!window.list.canUndo()) {
			$(".action-undo").prop('disabled', true);
		}
	} else {
		$(".list-name").text("No list selected");
		$(".list-action").prop('disabled', true);
		$(".question .item").text("");
	}
}
function addItems() {
	if (window.list) {
		window.list.saveState();
		var names = $("#new-items").val().split("\n");
		$("#new-items").val("");
		for (var i = 0; i < names.length; i++) {
			window.list.addItemByName(names[i]);
		}
		updateList();
		saveLocal();
	}
}
function listUndo() {
	if (window.list && window.list.canUndo()) {
		window.list.undo();
		updateList();
		saveLocal();
	}
}
function answerQuestion(el) {
	window.list.saveState();
	if ($(el).hasClass("item-a")) {
		window.list.resolve(window.question[0], window.question[1]);
	} else if ($(el).hasClass("item-b")) {
		window.list.resolve(window.question[1], window.question[0]);
	}
	$(".question .item").blur();
	updateList();
	saveLocal();
}
function reset() {
	loadDefault();
	var name = "LList";
	createList(name);
	selectList($(".lists-buttons a:text('"+name+"')"), name);
	window.list.addItemByName("0");
	window.list.addItemByName("1");
	window.list.addItemByName("2");
	window.list.addItemByName("3");
	updateList();
	saveLocal();
}
function exportList() {
	if (window.list) {
		var str = "";
		var order = window.list.getOrder();
		for (var i = 0; i < order.length; i++) {
			str += window.list.items[order[i]] + "\r\n";
		}
		var el = $("<a/>");
		el.attr("href", 'data:text/plain;charset=utf-8,' + encodeURIComponent(str));
		el.attr("download", window.list.name + " export.txt");
		el.css("display", "none");
		$("body").append(el);
		el[0].click();
		el.remove();
	}
}

$(".form-create-list").submit(function(e) {
	e.preventDefault();
	createList();
	return false;
});
$(".action-remove-list").click(removeList);
$(".action-remove-items").click(removeItems);
$(".action-remove-order").click(removeOrder);
$(".action-add-item").click(addItems);
$(".action-undo").click(listUndo);
$(".action-export").click(exportList);
$(".question .item").click(function(e){
	answerQuestion(e.target);
});
loadLocal();
updateGui();
updateList();
