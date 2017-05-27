<!DOCTYPE html>
<html>
<head>
	<title>Sortee</title>
	<script src="js/jquery-3.1.1.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<link rel="stylesheet" href="css/bootstrap.min.css" type="text/css" />
	<link rel="stylesheet" href="css/bootstrap-theme.min.css" type="text/css" />
	<link rel="stylesheet" href="css/sortee.css" type="text/css" />

</head>
<body>
<div>
	<ul id="list-local">
		
	</ul>
	<label for="new-list-name">Create list:</label>
	<input id="new-list-name" type="text" autofocus />
	<button type="button" onclick="createList();">Create</button>

	<h1 class="list-name">No list selected</h1>
	<button type="button" onclick="removeList();">Remove list</button>
	<br>
	<select class="list-items" size="10"></select>
	<br>
	<label for="new-item-name">Add item:</label>
	<input id="new-item-name" type="text" />
	<button type="button" onclick="addItem();">Add</button>
</div>
<script src="js/sortee.js"></script>
	<script src="js/sortee-temp.js"></script> <!-- temp -->
<script>
	loadLocal();
	updateGui();
</script>
</body>
</html>