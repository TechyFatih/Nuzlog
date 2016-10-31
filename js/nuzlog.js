var exports = {};
(function() {
	"use strict"
	
	//Global variables
	var currentGame = false;
	var party = [];
	var pc = []
	var cemetery = [];
	
	//Run when doc is ready
	$(document).ready(function() {
		//Event handlers
		$(".popup .close").click(closePopup);
		
		$("#newGameButton").click(createNewGame);
		$("#newGame").submit(newGame);
		
		$("#saveLoadGameButton").click(createSaveLoadGame);
		$("#loadGame").click(loadGame);
		
		$("#log").submit(logMessage);
		$("#log a").click(deleteLastEntry);
		
		$("#addPokemonButton").click(addPokemonPopup);
		$("#addPokemonForm").submit(addPokemon);
		
		//Populate data lists
		combobox($("#game"), data.games, true, "Pokemon Ruby");
		combobox($("#pokemon"), data.pokemon, true, "Bulbasaur");
		$("#pokemon").scombobox("change", addPokemonChanged);
		combobox($("#ability"), data.abilities, true, "Overgrow");
		combobox($("#moves select"), data.moves, false, "");
		$("#requiredMove").scombobox({required: true});
		
		$(document).foundation(); //When everything is ready, load Foundation plugins
	});
	
	
	//General functions

	function escapeHtml(text) {
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};

		return text.replace(/[&<>"']/g, function(m) { return map[m]; }).trim();
	}

	function combobox(jquery, options, required, placeholder) {
		var data = [];
		for (var i = 0; i < options.length; i++) {
			data.push({value: options[i], text: options[i]});
		}
		jquery.scombobox({data: data, empty: true, required: required, sort: false, fullMatch: true, invalidAsValue: true, maxHeight: "350%", placeholder: placeholder});
	}
	
	function getValue(jqstring) {
		var jquery = $(jqstring);
		if (jquery.hasClass("scombobox")) {
			return escapeHtml(jquery.scombobox("val"));
		} else {
			return escapeHtml(jquery.val());
		}
	}
	
	function closePopup() {
		$(".popup").find("input[type=text], textarea").val("");
		$(".popup select").each(function(i) {
			$(this)[0].selectedIndex = 0;
		});
		$("#animate img").attr("src", "img/question.png");
		$("#level").val(5);
		$(".popup").hide();
		$("#full").hide();
		if (!currentGame)
			$("#main").show();
	}
	
	function disableProperties(disableGenders, disableNatures, disableAbilities) {
		var disabled = [];
		if (disableGenders) disabled.push("Genders");
		if (disableNatures) disabled.push("Natures");
		if (disableAbilities) disabled.push("Abilities");
		if (disabled.length > 0) {
			$("#disabled").text("Disabled: " + disabled.join(", "));
		} else {
			$("#disabled").text("All Enabled");
		}
		$("#gender").prop('disabled', disableGenders);
		$("#nature").prop('disabled', disableNatures);
		$("#ability").scombobox("disabled", disableAbilities);
	}

	
	//New game functions
	
	function createNewGame() {
		var confirmNewGame = true;
		if (currentGame)
			confirmNewGame = confirm("Are you sure you want to create a new game? All unsaved changes will be lost.");
		if (confirmNewGame) {
			$("#main").hide();
			$("#full").show();
			$("#createNewGame").show();
		}
	}

	function newGame() {
		var title = getValue("#title");
		var game = getValue("#game");
		var name = getValue("#name");
		
		if (title == "" || game == "" || name == "")
			alert("Please make sure all fields are entered.");
		else {
			$("#titleLabel").text(title);
			$("#gameLabel").text(game);
			$("#nameLabel").text(name);
			disableProperties($("#disableGenders").prop('checked'), $("#disableNatures").prop('checked'), $("#disableAbilities").prop('checked'));

			currentGame = true;
			$("#journal").empty();
			closePopup();
			return false;
		}
	}
	
	
	//Saving and loading functions
	
	function createSaveLoadGame() {
		if (currentGame) {
			var save = $("#titleLabel").text();
			save += "\n" + $("#gameLabel").text();
			save += "\n" + $("#nameLabel").text();
			var disabled = $("#disabled").text();
			if (disabled.startsWith("Disabled: ")) {
				save += "\n"  + disabled;
			}
			save += "\n";
			$("#journal").children().each(function(i) {
				save += "\n";
				var log = $(this).children();
				save += "[" + log.first().text() + "] " + log.first().next().text() + ": " + log.last().html().replace(/<br>/g, "\t");
			});
			$("#saveGame").val(save);
		}
		
		$("#main").hide();
		$("#full").show();
		$("#saveLoadGame").show();
	}
	
	function loadGame() {
		var confirmLoadGame = true;
		if (currentGame)
			confirmLoadGame = confirm("Are you sure you want to load another game? All unsaved changes will be lost.");
		if (confirmLoadGame) {
			var load = $("#saveGame").val();
			if (load == "") {
				alert("No save file detected!");
			} else {
				var lines = load.split("\n");
				try {
					// Title, game, trainer name, disabled properties
					var title = lines.shift();
					var game = lines.shift();
					if (game == undefined || game == "") throw "missing game name";
					var name = lines.shift();
					if (name == undefined || game == "") throw "missing trainer name";
					var disabled = lines.shift();
					var disableGenders = false;
					var disableNatures = false;
					var disableAbilities = false;
					if (disabled != undefined) {
						if (disabled.startsWith("Disabled: ")) {
							disabled.split(",").forEach(function(property) {
								var temp = property.trim().toLowerCase();
								if (temp == "genders") {
									disableGenders = true;
								} else if (temp == "natures") {
									disableNatures = true;
								} else if (temp == "abilities") {
									disableAbilities = true;
								}
							});
							lines.shift();
						} else if (disabled != "") throw "improper format with disabled features";
					}
					
					// Journal
					var journal = [];
					lines.forEach(function(log) {
						var time = log.substring(0, log.indexOf("]")).trim();
						if (time == "" || !(time.startsWith("["))) throw "improper format with log timestamp";
						var type = log.substring(log.indexOf("]") + 1, log.indexOf(":", 16)).trim();
						if (type == "") throw "improper format with log type";
						var entry = log.substring(log.indexOf(":", 16) + 1).trim();
						if (entry == "") throw "improper format with log entry";
						journal.push([time.substring(1), type, entry.replace(/\t/g, "<br>")]);
					});
					
					// Apply changes
					$("#titleLabel").text(title);
					$("#gameLabel").text(game);
					$("#nameLabel").text(name);
					disableProperties(disableGenders, disableNatures, disableAbilities);
					$("#journal").empty();
					party = [];
					pc = [];
					cemetery = [];
					journal.forEach(function(log) {
						insertLog(log[0], log[1], log[2]);
					});
					
					currentGame = true;
					closePopup();
				} catch(err) {
					alert("There was an error in loading the game: " + err);
				}
			}
		}
	}
	
	//Journal functions
	
	function logMessage() {
		var message = $("#log input[type=text]");
		if (message.val() == "")
			alert("Please make sure there is an entry to be logged.");
		else {
			log("Log", escapeHtml(message.val()));
			message.val("");
		}
		return false;
	}
	
	function log(type, entry) {
		var time = new Date().toLocaleString();
		time = time.substring(0, time.length-6) + time.substring(time.length-3);
		insertLog(time, type, entry);
	}
	
	function insertLog(time, type, entry) {
		var $row = $("<div/>", {class: "row"});
		var $timeCol = $("<div/>", {class: "large-4 small-3 columns", text: time});		
		var $typeCol = $("<div/>", {class: "large-2 small-3 columns", text: type});
		var $entryCol = $("<div/>", {class: "small-6 columns", html: entry});
		
		$row.append($timeCol);
		$row.append($typeCol);
		$row.append($entryCol);
		$("#journal").append($row);
	}

	function deleteLastEntry() {
		if ($("#journal").children().length) {
			if (confirm("Delete last entry?"))
				$("#journal div[class=row]:last-child").remove();
		} else alert("No entries in the journal to delete!");
	}
	
	//Add Pokemon functions
	
	function addPokemonPopup() {
		$("#full").show();
		$("#addPokemon").show();
	}
	
	function addPokemonChanged() {
		var name = getValue("#pokemon");
		var exist = $("#pokemon select option").filter(function() {
			return $(this).text() == name;
		}).length;
		if (exist) {
			$("#animate img").attr("src", "http://www.pokestadium.com/sprites/xy/" + name.toLowerCase() + ".gif");
		} else {
			$("#animate img").attr("src", "img/question.png");
		}
		//var pokemon = exports.BattlePokedex[name];
		
		
		/*$("#gender").find("option").remove();
		if (pokemon.gender == undefined) {
			$("#gender").append("<option value=\"M\">Male</option>");
			$("#gender").append("<option value=\"F\">Female</option>");
		} else {
			switch (pokemon.gender) {
				case "M":
					$("#gender").append("<option value=\"M\">Male</option>");
					break;
				case "F":
					$("#gender").append("<option value=\"M\">Female</option>");
					break;
				case "N":
					$("#gender").append("<option value=\"G\">Genderless</option>");
					break;
			}
		}
		
		$("#ability").find("option").remove();
		for (ability in pokemon.abilities)
			$("#ability").append("<option>" + pokemon.abilities[ability] + "</option>");
		
		$(".move").find("option").remove();
		$(".move").each(function(index) {
			if (index != 0) $(this).append("<option></option>");
		});
		for (move in exports.BattleLearnsets[name].learnset) {
			$(".move").append("<option>" + exports.BattleMovedex[move].name + "</option>");
		}*/
	}
	
	function addPokemon() {
		var name = getValue("#pokemon");
		var pokemon = name;
		var nickname = getValue("#nickname");
		if (nickname != "" && nickname != name)
			pokemon = nickname + " (" + name + ")";

		var gender;
		if ($("#gender").is(":enabled")) {
			gender = getValue("#gender");
			pokemon += " (" + gender + ")";
		}
			
		var item = getValue("#item");
		if (item != "")
			pokemon += " @ " + item;
		
		var ability;
		if ($("#ability .scombobox-display").is(":enabled")) {
			ability = getValue("#ability");
			pokemon += "<br>Ability: " + ability;
		}
		
		var level = getValue("#level");
		pokemon += "<br>Level: " + level;
		
		var nature;
		if ($("#nature").is(":enabled")) {
			nature = getValue("#nature");
			pokemon += "<br>" + nature + " Nature";
		}
		
		var moves = [];
		$("#moves .scombobox-display").each(function() {
			var move = getValue(this);
			moves.push(move);
			pokemon += "<br>-" + move;
		});
		
		var loc = getValue("#method") + getValue("#location");
		pokemon += "<br>" + loc;
		
		log("Pokemon", pokemon);
		
		var poke = {};
		poke.name = name;
		poke.nickname = nickname;
		poke.gender = gender;
		poke.item = item;
		poke.ability = ability;
		poke.level = level;
		poke.nature = nature;
		poke.moves = moves;
		poke.loc = loc;
		
		party.push(poke);
		
		closePopup();
		console.log(party);
		return false;
	}
})();