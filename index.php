<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Sortee</title>
	<script src="js/jquery-3.1.1.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<link rel="stylesheet" href="css/bootstrap.min.css" type="text/css" />
	<link rel="stylesheet" href="css/bootstrap-theme.min.css" type="text/css" />
	<link rel="stylesheet" href="css/sortee.css" type="text/css" />
</head>
<body>
<div class="container">
	<div class="row first-row">
		<div class="col-xs-6">
			<form class="form-inline form-create-list">
				<div class="form-group">
					<label for="new-list-name">Create list:</label>
					<input id="new-list-name" type="text" class="form-control" autofocus />
					<button type="submit" class="btn btn-default action-create-list">Create</button>
				</div>
			</form>
		</div>
		<div class="col-xs-6">
			<div class="lists-buttons list-group"></div>
		</div>
	</div>
	<div class="row">
		<div class="col-xs-6">
			<h1 class="list-name">No list selected</h1>
			<p class="lead">Unknown: <span class="list-unknown"></span></p>
			<div class="question">
				<div class="btn-group btn-group-justified" role="group">
					<div class="btn-group btn-group-lg" role="group">
						<button type="button" class="btn btn-default item item-a list-action"></button>
					</div>
					<div class="btn-group btn-group-lg" role="group">
						<button type="button" class="btn btn-default item item-b list-action"></button>
					</div>
				</div>
			</div>
		</div>
		<div class="col-xs-3">
			<div class="control-group">
				<select multiple id="list-items-selection" class="list-items form-control list-action" size="20"></select>
			</div>
		</div>
		<div class="col-xs-3">
			<div class="control-group">
				<textarea id="new-items" class="form-control list-action" placeholder="Add items"></textarea>
			</div>
			<div class="control-group space-down">
				<button type="button" class="btn btn-default list-action action-add-item">&nbsp;&nbsp;Add&nbsp;&nbsp;</button>
			</div>
			<div class="control-group space-down">
				<button type="button" class="btn btn-info list-action action-undo">&nbsp;Undo&nbsp;</button>
				<button type="button" class="btn btn-success list-action action-export">Export</button>
			</div>
			<div class="control-group">
				<button type="button" class="btn btn-warning list-action action-remove-items">Remove selected</button>
				<button type="button" class="btn btn-warning list-action action-remove-order">Remove order</button>
				<br>
				<button type="button" class="btn btn-danger list-action action-remove-list">Remove list</button>
			</div>
		</div>
	</div>
</div>
<script src="js/sortee.js"></script>
</body>
</html>