var maxTilesPerLine = 9;

var tiles = new buckets.Dictionary();
var debugMode = false;

var NOTILE = -1,
	PLAYER1 = 0,
	PLAYER2 = 1,
	EMPTYTILE = 2;

var playerScores = [24, 24];

var board = [	[  NOTILE,  NOTILE, PLAYER1, PLAYER2,  NOTILE,  NOTILE,  NOTILE,  NOTILE,  NOTILE ],
							[  NOTILE, PLAYER1, PLAYER2, PLAYER1, PLAYER2,  NOTILE,  NOTILE,  NOTILE,  NOTILE ],
              [  NOTILE, PLAYER2, PLAYER1, PLAYER2, PLAYER1, PLAYER2, PLAYER1,  NOTILE,  NOTILE ],
              [  NOTILE, PLAYER1, PLAYER2, PLAYER1, PLAYER2, PLAYER1, PLAYER2, PLAYER1, PLAYER2 ],
              [ PLAYER1, PLAYER2, PLAYER1, PLAYER2,  NOTILE, PLAYER2, PLAYER1, PLAYER2, PLAYER1 ],
              [ PLAYER2, PLAYER1, PLAYER2, PLAYER1, PLAYER2, PLAYER1, PLAYER2, PLAYER1,  NOTILE ],
              [  NOTILE,  NOTILE, PLAYER1, PLAYER2, PLAYER1, PLAYER2, PLAYER1, PLAYER2,  NOTILE ],
              [  NOTILE,  NOTILE,  NOTILE,  NOTILE, PLAYER2, PLAYER1, PLAYER2, PLAYER1,  NOTILE ],
              [  NOTILE,  NOTILE,  NOTILE,  NOTILE,  NOTILE, PLAYER2, PLAYER1,  NOTILE,  NOTILE ]	];

/* Colors and images */
var strokeColors = ['black', 'black'],
	fillColors = ['rgb(255,127,127)', 'rgb(255,255,127)', 'argb'],
	sweetOrange = 'rgb(240,181,52)',
	emptyTileStrokeColor = 'rgb(142,142,142)',
	pauseImage = 'pause',
	playImage = 'play',
	previousImage = 'previous',
	nextImage = 'next',
	okImage = 'ok',
	pauseDisabledImage = 'pause_disabled',
	playDisabledImage = 'play_disabled',
	previousDisabledImage = 'previous_disabled',
	helpOnImage = 'help_on',
	helpOffImage = 'help_off',
	nextDisabledImage = 'next_disabled',
	playPauseColor = 'rgb(229,28,35)',
	prevNextColor = 'rgb(139,195,74)',
	playPauseDisabledColor = 'rgb(114,14,17)',
	prevNextDisabledColor = 'rgb(69,97,37)',
	startImage = 'start',
	normalStrokeWidth = 2,
	selectedStrokeWidth = 5,
	possibleStrokeWidth = 5,
	emptyStrokeWidth = 4,
	selectedStrokeColor = prevNextColor,
	possibleStrokeColor = 'rgb(240,181,52)';

/* Configuration of the size of the canvas */
var canvasWidth = view.viewSize._width,
	canvasHeight = view.viewSize._height,
	hudWidth = canvasWidth / 5,
	hudHeight = canvasHeight,
	boardWidth = canvasWidth - hudWidth,
	boardHeight = canvasHeight,
	boardCenterX = hudWidth + boardWidth / 2,
	boardCenterY = boardHeight / 2,
	boardPadding = Math.min(boardWidth, boardHeight) / 20,
	bannerHeight = hudHeight / 30;

/* The configuration of the board */
var configuration = '',
	playModeOn = true,
	step = 0,
	playPauseActive = true,
	nextActive = true,
	previousActive = true; //boolean that is true if the button play is clicked, false otherwise.

/*********************************************************
******************* Setting up the HUD *******************
*********************************************************/

var tileDiameter = Math.floor((Math.min(canvasHeight, canvasWidth) - 2 * boardPadding) / maxTilesPerLine),
	tileRadius = tileDiameter / 2,
	tilePadding = 5,
	pieceRadius = tileRadius - tilePadding,
	emptyTileRadiusFactor = 0.5,
	fullTileRadiusFactor = 2,
	xOffset = boardCenterX - (maxTilesPerLine / 2) * tileDiameter + tileRadius,
	yOffset = boardPadding + tileRadius;


var borderSize = 10;

var unplacedTiles = [[],[]];

var buttonRadius = Math.min(hudWidth / 10, hudHeight / 24),
	buttonSpacing = buttonRadius * 7 / 4,
	arrowSize = buttonRadius / 2,
	buttonCenterX = hudWidth / 2,
	buttonCenterY = 4 * borderSize + 16 * bannerHeight - 4 * buttonRadius / 2;

function Tile(i, j, tileType) {
	this.xCoord = xOffset + j * tileDiameter;
	this.yCoord = yOffset + i * tileDiameter;
	this.tileType = tileType;
	this.towerHeight = 1;
	this.circle = new Path.Circle(new Point(this.xCoord, this.yCoord), pieceRadius);
	this.circle.strokeWidth = normalStrokeWidth;
	this.heightText = new PointText({
		point: new Point(this.xCoord, this.yCoord + 8),
		justification: 'center',
		fontSize: 16,
		fontFamily: 'Roboto, sans-serif',
		fillColor: 'black',
		content: "" + this.towerHeight
	});
	this.tileGroup = new Group();
	this.tileGroup.addChild(this.circle);
	this.tileGroup.addChild(this.heightText);
}

Tile.prototype.updateAspect = function() {
	if (this.tileType == EMPTYTILE) {
		this.heightText.visible = false;
		this.circle.strokeColor = emptyTileStrokeColor;
		this.circle.fillColor.alpha = 0;
		this.circle.strokeWidth = emptyStrokeWidth;
		this.circle.scale(emptyTileRadiusFactor);
	}
	else {
		this.heightText.visible = true;
		this.heightText.content = this.towerHeight;
		this.circle.strokeColor = strokeColors[this.tileType];
		this.circle.fillColor = fillColors[this.tileType];
		if (this.circle.strokeWidth == emptyStrokeWidth) {
			this.circle.scale(fullTileRadiusFactor);
		}
		this.circle.strokeWidth = normalStrokeWidth;
		this.circle.radius = tileRadius;
	}
};

function Button(centerX, centerY, radius, bgColor, image) {
	this.bgbg = new Path.Circle(new Point(centerX, centerY), radius + 1);
	this.bgbg.fillColor = 'rgb(170,170,170)';
	this.bg = new Path.Circle(new Point(centerX, centerY), radius);
	this.bg.fillColor = bgColor;
	this.raster = new Raster(image);
	this.raster.scale(getScaleFactor(this.raster.width, this.raster.height,  5 * radius / 3, 5 * radius / 3));
	this.raster.position = new Point(centerX, centerY);
	this.buttonGroup = new Group();
	this.buttonGroup.addChild(this.bgbg);
	this.buttonGroup.addChild(this.bg);
	this.buttonGroup.addChild(this.raster);
	this.buttonGroup.visible = false;
}

function Card(x1, y1, x2, y2, shadowSizeX, shadowSizeY, title) {
	this.shadowSizeX = shadowSizeX;
	this.shadowSizeY = shadowSizeY;
	this.cornerSize = new Size(1, 1);
	this.bg = new Rectangle(new Point(x1 - shadowSizeX, y1), new Point(x2 + shadowSizeX, y2 + shadowSizeY));
	this.bgRounded = new Shape.Rectangle(this.bg, this.cornerSize);
	this.bgRounded.fillColor = 'rgb(170,170,170)';

	this.fg = new Rectangle(new Point(x1, y1), new Point(x2, y2));
	this.fgRounded = new Shape.Rectangle(this.fg, this.cornerSize);
	this.fgRounded.fillColor = 'white';

	this.banner = new Rectangle(new Point(x1, y1), new Point(x2, y1 + bannerHeight));
	this.bannerRounded = new Shape.Rectangle(this.banner, this.cornerSize);
	this.bannerRounded.fillColor = sweetOrange;

	this.text = new PointText({
		point: new Point(x1 + (x2 - x1) / 2, y1 + hudHeight / 42),
		justification: 'center',
		fontSize: hudHeight / 60,
		fillColor: 'black',
		content: title,
		fontFamily: 'Roboto, sans-serif',
		fontWeight: 800,
		lineHeight:1.2
	});

	this.cardGroup = new Group();
	this.cardGroup.addChild(this.bgRounded);
	this.cardGroup.addChild(this.fgRounded);
	this.cardGroup.addChild(this.bannerRounded);
	this.cardGroup.addChild(this.text);
	this.cardGroup.visible = false;
}

function ColoredText(x1, y1, shadowSizeX, shadowSizeY, textContent, fgColor) {
	this.shadowSizeX = shadowSizeX;
	this.shadowSizeY = shadowSizeY;
	this.cornerSize = new Size(2, 2);
	this.fgColorIndex = fgColor;

	this.text = new PointText({
		point: new Point(x1, y1),
		justification: 'left',
		fontSize: hudHeight / 60,
		fillColor: 'black',
		content: textContent,
		fontFamily: 'Roboto, sans-serif',
		fontWeight: 400,
		lineHeight:1.2
	});

	this.fg = this.text.bounds.clone();
	this.fg.width = this.fg.width + 2 * (hudHeight / 256);
	this.fg.height = this.fg.height + 2 * (hudHeight / 256);
	this.fg.x = this.fg.x - hudHeight / 256;
	this.fg.y = this.fg.y - hudHeight / 256;
	this.fgRounded = new Shape.Rectangle(this.fg, this.cornerSize);
	this.fgRounded.fillColor = fillColors[this.fgColorIndex];

	this.textGroup = new Group();
	this.textGroup.addChild(this.fgRounded);
	this.textGroup.addChild(this.text);
	this.textGroup.visible = false;
}

function getScaleFactor(imgWidth, imgHeight, desiredWidth, desiredHeight) {
	var imgWidthScale = desiredWidth / imgWidth,
		imgHeightScale = desiredHeight / imgHeight;
	return Math.min(imgWidthScale, imgHeightScale);
}

function coordToKey(i, j) {
	return i + " " + j;
}

/******************************************************************************
************************* Creating Graphical Elements *************************
******************************************************************************/
var possiblePlacements = new buckets.Dictionary(),
	possibleMoves = new buckets.Dictionary(),
	currentPlayer = PLAYER1,
	selectedTile = '';

var startButtonRadius = Math.min(canvasWidth / 10, canvasHeight / 10),
	startButtonX = view.center.x,
	startButtonY = view.center.y,
	startButtonColor = sweetOrange;

var startButton = new Button(startButtonX, startButtonY, startButtonRadius, sweetOrange, startImage);
startButton.buttonGroup.visible = true;
startButton.buttonGroup.on('click', initializeBoard);

var statusCard = new Card(borderSize, 2 * borderSize, hudWidth - borderSize, 2 * borderSize + 8 * bannerHeight, 1, 2, "Game Status"),
	hudCard = new Card(borderSize, 4 * borderSize + 8 * bannerHeight, hudWidth - borderSize, 4 * borderSize + 16 * bannerHeight, 1, 2, "HUD");

var playPauseButton = new Button(buttonCenterX, buttonCenterY, buttonRadius, playPauseColor, pauseImage),
	previousButton = new Button(buttonCenterX - (buttonRadius + buttonSpacing), buttonCenterY, buttonRadius, prevNextColor, previousImage),
	nextButton = new Button(buttonCenterX + (buttonRadius + buttonSpacing), buttonCenterY, buttonRadius, prevNextColor, nextImage);

playPauseButton.buttonGroup.on('click', playPauseClicked);
nextButton.buttonGroup.on('click', nextClicked);
previousButton.buttonGroup.on('click', previousClicked);
	

var scorePlayer1Line = new ColoredText(hudWidth / 8, 2 * borderSize + 3 * bannerHeight, 1, 2, 'Player 1 score: 24', PLAYER1);
var scorePlayer2Line = new ColoredText(hudWidth / 8, 2 * borderSize + 4 * bannerHeight, 1, 2, 'Player 2 score: 24', PLAYER2);

var winnerDescription = new PointText({
	point: new Point(hudWidth / 8, 2 * borderSize + 6.5 * bannerHeight),
	justification: 'left',
	fontSize: hudHeight / 60,
	fillColor: 'black',
	content: 'Current winner: ',
	fontFamily: 'Roboto, sans-serif',
	fontWeight: 400,
	lineHeight:1.2,
	visible: false
});

var winnerLineOffset = winnerDescription.bounds.x + winnerDescription.bounds.width + hudHeight / 120;
var winnerLine = new ColoredText(winnerLineOffset, 2 * borderSize + 6.5 * bannerHeight, 1, 2, 'Player 1', NOTILE);

var statusLine1 = new PointText({
	point: new Point(hudWidth / 8, 4 * borderSize + 10 * bannerHeight),
	justification: 'left',
	fontSize: hudHeight / 60,
	fillColor: 'black',
	content: 'Satus Line #1',
	fontFamily: 'Roboto, sans-serif',
	fontWeight: 400,
	lineHeight: 1.2,
	visible: false
});

var statusLine2 = new PointText({
	point: new Point(hudWidth / 8, 4 * borderSize + 11 * bannerHeight),
	justification: 'left',
	fontSize: hudHeight / 60,
	fillColor: 'black',
	content: 'Satus Line #2',
	fontFamily: 'Roboto, sans-serif',
	fontWeight: 400,
	lineHeight:1.2,
	visible: false
});

function initializeBoard() {
	startButton.buttonGroup.remove();

	for (var i = 0; i < maxTilesPerLine; i++) {
		for (var j = 0; j < maxTilesPerLine; j++) {
			if (board[i][j] != NOTILE) {
				addTile(i, j, board[i][j]);
			}
		}
	}
	
	statusCard.cardGroup.visible = true;
	hudCard.cardGroup.visible = true;
	scorePlayer1Line.textGroup.visible = true;
	scorePlayer2Line.textGroup.visible = true;
	winnerDescription.visible = true;
	updateScoreLines();
	winnerLine.textGroup.visible = true;
	statusLine1.visible = true;
	statusLine2.visible = true;

	doConnect();
}

function addTile(i, j, tileType) {
	var newTile = new Tile(i, j, tileType);
	tiles.set(coordToKey(i, j), newTile);
	newTile.updateAspect();
	newTile.tileGroup.onClick = function(event) {
		towerClicked(i, j);
	};
	newTile.tileGroup.onMouseEnter = function(event) {
		towerMouseEnter(i, j);
	};
	newTile.tileGroup.onMouseLeave = function(event) {
		towerMouseLeave(i, j);
	};
}


/******************************************************************************
*************************** Websockect Communication **************************
******************************************************************************/
var CONFIG_MSG = 'CONFIG',
	READY_MSG = 'READY',
	PLAYMOVE_MSG = 'PLAY',
	PAUSE_MSG = 'PAUSE',
	NEXT_MSG = 'NEXT',
	PREVIOUS_MSG = 'PREVIOUS',
	FINISHED_MSG = 'FINISHED',
	ACKNOWLEDGEMENT_MSG = 'ACKNOWLEDGEMENT',
	ACTIONS_MSG = 'ACTIONS',
	HASMOVED_MSG = 'MOVE';

var CONFIG_HvH = 'human vs human',
	CONFIG_HvA = 'human vs ai',
	CONFIG_AvH = 'ai vs human',
	CONFIG_AvA = 'ai vs ai',
	CONFIG_R = 'replay';

function doConnect() {
	console.log("Connected at ws://localhost:8500/");
  websocket = new WebSocket("ws://localhost:8500/");
  websocket.onopen = function(evt) { onOpen(evt) };
  websocket.onclose = function(evt) { onClose(evt) };
  websocket.onmessage = function(evt) { onMessage(evt) };
  websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
	console.log("Opening websocket communication");
}

function onClose(evt) {
	console.log("Closing websocket communication");
}

function onMessage(evt) {
	var msg = evt.data.trim().split("\n");
	//console.log("MSG \n" + msg)
	if (msg[0] == CONFIG_MSG) {
		if (msg[1] == CONFIG_R) {
			setReplayConfig();
		}
		else {
			setPlayConfig(msg[1]);
		}
	}
	else if (msg[0] == PLAYMOVE_MSG) {
		playAction(msg.slice(1));
		paper.view.draw();
		doSend(ACKNOWLEDGEMENT_MSG + "\n");
	}
	else if (msg[0] == PREVIOUS_MSG) {
		undoAction(msg.slice(1));
	}
	else if (msg[0] == FINISHED_MSG) {
		finished(msg.slice(1));
		paper.view.draw();
	}
	else if (msg[0] == ACTIONS_MSG) {
		possibleActions(msg.slice(1));
	}
}

function onError(evt) {
	console.log("onError: " + evt);
	websocket.close();
}

function doSend(message) {
	websocket.send(message);
}

function doDisconnect() {
	console.log("doDisconnect");
	websocket.close();
}

function setReplayConfig() {
	playPauseButton.buttonGroup.visible = true;
	previousButton.buttonGroup.visible = true;
	nextButton.buttonGroup.visible = true;
	activatePlayPause();
	desactivateNext();
	desactivatePrevious();
	statusLine1.content = "Step 1: Player 1's turn";
	statusLine2.content = '';
	doSend(READY_MSG + "\n" + CONFIG_R);
}

function setPlayConfig(configType) {
	nextActive = false;
	previousActive = false;
	playPauseActive = false;
	playPauseButton.buttonGroup.visible = false;
	previousButton.buttonGroup.visible = false;
	nextButton.buttonGroup.visible = false;
	
	doSend(READY_MSG + "\n" + configType);
}

function activateNext() {
	nextActive = true;
	nextButton.bg.fillColor = prevNextColor;
	nextButton.raster.source = nextImage;
}

function desactivateNext() {
	nextActive = false;
	nextButton.bg.fillColor = prevNextDisabledColor;
	nextButton.raster.source = nextDisabledImage;
}

function activatePrevious() {
	previousActive = true;
	previousButton.bg.fillColor = prevNextColor;
	previousButton.raster.source = previousImage;
}

function desactivatePrevious() {
	previousActive = false;
	previousButton.bg.fillColor = prevNextDisabledColor;
	previousButton.raster.source = previousDisabledImage;
}

function activatePlayPause() {
	playPauseActive = true;
	playPauseButton.bg.fillColor = playPauseColor;
	if (playModeOn) {
		playPauseButton.raster.source = pauseImage;
	}
	else {
		playPauseButton.raster.source = playImage;
	}
}

function desactivatePlayPause() {
	playPauseActive = false;
	playPauseButton.bg.fillColor = playPauseDisabledColor;
	playPauseButton.raster.source = playDisabledImage;
	playModeOn = false;
}

function playPauseClicked() {
	if (playPauseActive) {
		if (playModeOn) {
			playPauseButton.raster.source = playImage;
			doSend(PAUSE_MSG + "\n");
			if (step > 1) {
				activatePrevious();
			}
			activateNext();
		}
		else {
			playPauseButton.raster.source = pauseImage;
			doSend(PLAYMOVE_MSG + "\n");
			desactivatePrevious();
			desactivateNext();
		}
		playModeOn = !playModeOn;
	}
}

function nextClicked() {
	if (nextActive) {
		doSend(NEXT_MSG + "\n");
	}
}

function previousClicked() {
	if (previousActive) {
		doSend(PREVIOUS_MSG + "\n");
	}
}

function towerClicked(i, j) {
	if (selectedTile == '' && possibleMoves.containsKey(coordToKey(i, j))) {
		selectedTile = coordToKey(i, j);
		tiles.get(selectedTile).circle.strokeWidth = selectedStrokeWidth;
		tiles.get(selectedTile).circle.strokeColor = selectedStrokeColor;
		var moves = possibleMoves.get(selectedTile)
		for (var k = 0; k < moves.length; k++) {
			tiles.get(coordToKey(moves[k][0], moves[k][1])).circle.strokeWidth = possibleStrokeWidth;
			tiles.get(coordToKey(moves[k][0], moves[k][1])).circle.strokeColor = possibleStrokeColor;
		}
		statusLine2.content = 'Click on a tower to stack on.';
	}
	else if (selectedTile == coordToKey(i, j)) {
		selectedTile = '';
		var tile = tiles.get(coordToKey(i, j));
		tile.updateAspect();
		var moves = possibleMoves.get(coordToKey(i, j))
		for (var k = 0; k < moves.length; k++) {
			tiles.get(coordToKey(moves[k][0], moves[k][1])).updateAspect();
		}
		statusLine2.content = 'Click on a tower to select it.';
	}
	else {
		if (possibleMoves.containsKey(selectedTile)) {
			var moves = possibleMoves.get(selectedTile)
			for (var k = 0; k < moves.length; k ++) {
				if (moves[k][0] == i && moves[k][1] == j) {
					movePerformed(selectedTile, i, j)
					i = moves.length
				}
			}
		}
	}
}

function towerMouseEnter(i, j) {
	var tile = tiles.get(coordToKey(i, j));
	if (selectedTile == '' && possibleMoves.containsKey(coordToKey(i, j))) {
		tile.circle.strokeWidth = possibleStrokeWidth;
		tile.circle.strokeColor = possibleStrokeColor;
	}
}

function towerMouseLeave(i, j) {
	var tile = tiles.get(coordToKey(i, j));
	if (selectedTile == '' && possibleMoves.containsKey(coordToKey(i, j))) {
		tile.updateAspect();
	}
}

function playAction(action) {
	currentPlayer = PLAYER1;
	if (parseInt(action[0]) == -1) {
		currentPlayer = PLAYER2;
	}
	step = parseInt(action[1]) + 2;
	if (!playModeOn) {
		activatePrevious();
	}
	var fromPos = action[2].split(" ").map(function(key, val, array) {
    return parseInt(key);
  });
	var toPos = action[3].split(" ").map(function(key, val, array) {
		return parseInt(key);
  });
  statusLine1.content = 'Step ' + (step) + ": " + 'Player ' + (2 - currentPlayer) + "'s turn";
	statusLine2.content = '';
	moveTower(fromPos[0], fromPos[1], toPos[0], toPos[1]);
	if (action.length > 4) {
		finished(action.slice(4));
	}
}

function undoAction(action) {
	currentPlayer = PLAYER1;
	if (parseInt(action[0]) == 1) {
		currentPlayer = PLAYER2;
	}
	step = parseInt(action[1]) + 1;
	if (step == 1) {
		desactivatePrevious();
	}
	activatePlayPause();
	activateNext();
	var moveType = action[2];
	var fromPos = action[2].split(" ").map(function(key, val, array) {
    return parseInt(key);
  });
	var toPos = action[3].split(" ").map(function(key, val, array) {
		return parseInt(key);
  });
  var formerTowers = action[4].split(" ").map(function(key, val, array) {
		return parseInt(key);
  });
	statusLine1.content = 'Step ' + (step) + ": " + 'Player ' + (2 - currentPlayer) + "'s turn";
	statusLine2.content = ''
	splitTower(fromPos[0], fromPos[1], toPos[0], toPos[1], formerTowers[0], formerTowers[1]);
}

function finished(message) {
	statusLine1.content = message[0];
	if (message.length > 1) {
		statusLine2.content = message[1];
	}
	playPauseButton.buttonGroup.visible = true
	nextButton.buttonGroup.visible = true
	previousButton.buttonGroup.visible = true
	desactivateNext();
	desactivatePlayPause();
	activatePrevious();
}


function moveTower(fromI, fromJ, toI, toJ) {
	var coordKey1 = coordToKey(fromI, fromJ);
	var coordKey2 = coordToKey(toI, toJ);
	// Get the colors of the towers that will be modified
	var fromTowerType = tiles.get(coordKey1).tileType;
	var toTowerType = tiles.get(coordKey2).tileType;
	var fromTowerHeight = tiles.get(coordKey1).towerHeight;
	var toTowerHeight = tiles.get(coordKey2).towerHeight;
	// Update status of tower to
	tiles.get(coordKey2).towerHeight = fromTowerHeight + toTowerHeight;
	tiles.get(coordKey2).tileType = fromTowerType;
	// Update Status of tower from
	tiles.get(coordKey1).towerHeight = 0;
	tiles.get(coordKey1).tileType = EMPTYTILE;
	// Update the scores of the players
	playerScores[toTowerType] = playerScores[toTowerType] - 1;
	// Update the GUI
	tiles.get(coordKey1).updateAspect();
	tiles.get(coordKey2).updateAspect();
	updateScoreLines();
}

function splitTower(fromI, fromJ, toI, toJ, formerTowerFrom, formerTowerTo) {
	var coordKey1 = coordToKey(fromI, fromJ);
	var coordKey2 = coordToKey(toI, toJ);
	// Get the colors and heights of the former towers
	var fromTowerType = (formerTowerFrom > 0) ? PLAYER1 : PLAYER2;
	var toTowerType = (formerTowerTo > 0) ? PLAYER1 : PLAYER2;
	var fromTowerHeight = Math.abs(formerTowerFrom);
	var toTowerHeight = Math.abs(formerTowerTo);
	// Update status of tower to
	tiles.get(coordKey2).towerHeight = toTowerHeight;
	tiles.get(coordKey2).tileType = toTowerType;
	// Update Status of tower from
	tiles.get(coordKey1).towerHeight = fromTowerHeight;
	tiles.get(coordKey1).tileType = fromTowerType;
	// Update the scores of the players
	playerScores[toTowerType] = playerScores[toTowerType] + 1;
	// Update the GUI
	tiles.get(coordKey1).updateAspect();
	tiles.get(coordKey2).updateAspect();
	updateScoreLines();
}

function possibleActions(msg) {
	currentPlayer = PLAYER1;
	if (parseInt(msg[0]) == -1) {
		currentPlayer = PLAYER2;
	}
	step = parseInt(msg[1]);
	statusLine1.content = 'Step ' + step + ": " + 'Player ' + (currentPlayer + 1) + "'s turn";
	statusLine2.content = 'Click on a tower to select it.';
	for(var i = 2; i < msg.length; i++) {
  	var action = msg[i].split(" ");
		var fromPos = coordToKey(parseInt(action[0]), parseInt(action[1]));
		var toPos = [parseInt(action[2]), parseInt(action[3])];
		if (possibleMoves.containsKey(fromPos)) {
			possibleMoves.get(fromPos).push(toPos);
		}
		else {
			possibleMoves.set(fromPos, [toPos]);
		}
  }
}

function movePerformed(tileStr, i, j) {
	var actionStr = tileStr.split(" ")[0] + "\n";
	actionStr += tileStr.split(" ")[1] + "\n";
	actionStr += i + "\n";
	actionStr += j;
	if (possibleMoves.containsKey(tileStr)) {
		var posMoves = possibleMoves.get(tileStr)
		for (var k = 0; k < posMoves.length; k++) {
			tiles.get(coordToKey(posMoves[k][0], posMoves[k][1])).updateAspect();
		}
	}
	possibleMoves.clear();
	selectedTile = '';
	doSend(HASMOVED_MSG + "\n" + actionStr);
}

function updateScoreLines() {
	if (playerScores[PLAYER1] < 10) {
		scorePlayer1Line.text.content = 'Player 1 score:  ' + playerScores[PLAYER1];
	}
	else {
		scorePlayer1Line.text.content = 'Player 1 score: ' + playerScores[PLAYER1];
	}
	if (playerScores[PLAYER2] < 10) {
		scorePlayer2Line.text.content = 'Player 2 score:  ' + playerScores[PLAYER2];
	}
	else {
		scorePlayer2Line.text.content = 'Player 2 score: ' + playerScores[PLAYER2];
	}
	if (playerScores[PLAYER1] > playerScores[PLAYER2]) {
		winnerLine.text.content = 'Player 1';
		winnerLine.fgRounded.fillColor = fillColors[PLAYER1];
	}
	else if (playerScores[PLAYER2] > playerScores[PLAYER1]) {
		winnerLine.text.content = 'Player 2';
		winnerLine.fgRounded.fillColor = fillColors[PLAYER2];
	}
	else {
		var towersOfMaximalHeightDelta = getTowersOfMaximalHeightDelta();
		if (towersOfMaximalHeightDelta > 0) {
			winnerLine.text.content = 'Player 1';
			winnerLine.fgRounded.fillColor = fillColors[PLAYER1];
		}
		else if (towersOfMaximalHeightDelta < 0) {
			winnerLine.text.content = 'Player 2';
			winnerLine.fgRounded.fillColor = fillColors[PLAYER2];
		}
		else {
			winnerLine.text.content = '  Draw  ';
			winnerLine.fgRounded.fillColor = fillColors[NOTILE];
		}
	}
}

function getTowersOfMaximalHeightDelta() {
	var towerKeys = tiles.keys();
	var delta = 0;
	for (var i = 0; i < towerKeys.length; i++) {
		var tile = tiles.get(towerKeys[i]);
		if (tile.tileType == PLAYER1 && tile.towerHeight == 5) {
			delta = delta + 1;
		}
		else if (tile.tileType == PLAYER2 && tile.towerHeight == 5) {
			delta = delta - 1;
		}
	}
	return delta;
}

function onKeyDown(event) {
	if(event.key == 'space') {
		playPauseClicked();
	}

	if(event.key == 'left') {
		previousClicked();
	}

	if(event.key == 'right') {
		nextClicked();
	}
}

