// definiting the base constructor for all classes, which will execute the final class prototype's initialize method if exists
var Class = function () {
    this.initialize && this.initialize.apply(this, arguments);
};
Class.extend = function(childPrototype) { // defining a static method 'extend'
    var parent = this;
    var child = function() { // the child constructor is a call to its parent's
        return parent.apply(this, arguments);
    };
    child.extend = parent.extend; // adding the extend method to the child class
    var Surrogate = function() {}; // surrogate "trick" as seen previously
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();
    for (var key in childPrototype){
        child.prototype[key] = childPrototype[key];
    }
    return child; // returning the child class
};

// classe Note
var Note = Class.extend({	
	initialize : function(note,rang,interval){
		this.note = note;
		this.rang = rang;
		this.interval = interval;
	},
	print : function(){
		console.log("note : " +this.note + " rang : "+this.rang);
	}
});

// classe Position
var Position = Note.extend({	
	initialize : function(note,pos,string){
		this.note = note;
		this.pos = pos;
		this.string = string;
	},
	print : function(){
		console.log("note : " +this.note + " rang : "+this.rang + " pos : "+ this.pos + " string : " + this.string);
	}
});

// classe Positions
var Positions = Class.extend({	
	
	initialize : function(strings){		
		this.strings = [];
		for (var i = 0; i < strings; i++) {
			var tab = [];
			this.strings.push(tab);
		};
	},
	push : function(position){		
		this.strings[position.string].push(position);		
	},
	get : function(string,pos){
		var ret = null;
		for (var i = 0; i < this.strings[string].length; i++) {
			var position = this.strings[string][i];
			if (position.pos == pos) ret = position;
		};
		return ret;
	},
	print : function(){
		console.log("note : " +this.note + " rang : "+this.rang + " pos : "+ this.pos);
	}
});

// classe Fret
var Fret = Class.extend({	
	initialize : function(width,pos){
		this.width = width;
		this.pos = pos;		
	}
});

// classe Gamme
var Gamme = Class.extend({
	notes : ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'],
	intervalsGamme : ['R','2b','2','3b','3','4','5b','5','6','7b','7','R','2b','2','3b','3','4','5b','5','6','7b','R','2b','2'],

	initialize : function(intervales, nom){
		this.intervales = intervales;
		this.nom = nom;
	},	
	print : function(){
		console.log(this.intervales);
	},
	position : function(note){
		var positionNotes = note+':'+1;		
		var currentRank = 0;
		var aNote = new Note(note,1,this.intervalsGamme[currentRank]);
		var tabNotes = [aNote];		
		var j = this.notes.indexOf(aNote.note);
		var rank1 = j;

		for (var i = 0; i < this.intervales.length; i++) {			
			j+=this.intervales[i];
			currentRank+=this.intervales[i];
			var currentNote = this.notes[j];
			var newNote = new Note(currentNote, currentRank,this.intervalsGamme[currentRank]);
			tabNotes.push(newNote);
			positionNotes+=' '+currentNote+':'+(i+2);			
		};
		console.log(positionNotes);		
		return tabNotes;
	},
	positions : function (){
		for (var i = 0; i < 8; i++) {
			this.position(this.notes[i]);
		};
	}
});

// Classe Instru
var Instru = Class.extend({
	initialize : function(strings){
		this.strings = strings;
	},
	print : function(){
		console.log(this.strings);
	},
	positions : function(note, gamme){
		var positionNotes = gamme.position(note);
		var tabNotesOnStrings = [];
		var aPositions = new Positions(this.strings.length);

		// pour chaque corde
		for (var i = 0; i < this.strings.length; i++) {
			var string = this.strings[i];
			var stringPosition = gamme.notes.indexOf(string);
			var notesOnString = 'corde '+string+': ';
			var tabNotesOnTring = [];
			
			// pour chaque note de la gamme
			for (var j = 0; j < positionNotes.length; j++) {				
				var currentNote = positionNotes[j];												
				var notePosition = gamme.notes.indexOf(currentNote.note, stringPosition);
				// TODO retourner la note avec la position
				var noteOnString = notePosition-stringPosition;				
				notesOnString += ' ' + noteOnString;
				var aPosition = new Position(currentNote,noteOnString,i);
				aPositions.push(aPosition);
			};
			
			//console.log(notesOnString);			
		};
		//console.log(tabNotesOnStrings);
		return aPositions;
	},
	calculateFrets : function(){
		// TODO creer une classe Fret et calculer la largeur + la position
		var diap = 1600;
		var pos = 20;
		var tabFret = [];
		
		// fret 0
		var aFret = new Fret(20,0);
		tabFret.push(aFret);
		
		// on détermine la position et la largeur de chaque frette
		for(var i = 0; i < 12; i++) 
		{ 	 
			var fret = diap / 17.817154; 			
			diap -= fret;
						
			aFret = new Fret(fret,pos);
			pos += fret;
			tabFret.push(aFret);
		}
		
		console.log(tabFret);
		return tabFret;
	},
	renderTextPositions : function(note, gamme){
		var positions =  this.positions(note, gamme);
		console.log(positions);
		for (var i = 0; i < positions.length; i++) {
			var stringPositions = positions[i];
			var text ='';
			for (var j = 0; j < 12; j++) {
				if (stringPositions.indexOf(j)<0) {
					if (j==0) text+='|'; else text+='-';										
				}
				else{
					if (j==0) text+='o'; else text+='x';									
				};				
			};			
			console.log(text);
		};
	},
	renderRaphaelPositions : function(note, gamme,x,y){		
		var width = 900;
		var height = 200;
		var positions =  this.positions(note, gamme);			
		var tabFrets = this.calculateFrets();
		var paper = Raphael(x, y, width, height);	
		var tour = paper.rect(0, 0, width, height);
		
		var stringNotewidth = 20;
		var caseXWidth = 60;
		var case0Width = 20;
		var caseHeight = 20;
		var caseBorderColor = "#000";
		var pointRadius = 8;
		var pointColor = "#72a0e5";
		var pointToniqueColor = "#F00";
		var pointBorderColor = "#797980";
		var tabReperes = [3,5,7,9];
		var repereRadius = 2;
		var repereColor = "#000";
		var repereBorderColor = "#FFF";	
		var headHeight = 50;

		var titre = paper.text(100, 10, note + " " +  gamme.nom);
		titre.attr("font-size","16");
		
		// pour chaque demi-ton d'un octave
	    for (var i = 0; i < 12; i++) {
			var caseWidth = tabFrets[i].width;						
			var caseX = 50 + tabFrets[i].pos;
			
		  // pour chaque position de chaque corde
	      for (var j = 0; j < positions.strings.length; j++) {	      		      		    		    	
	    	if (i == 0) caseWidth = case0Width;

	    	var caseY = headHeight+(j*caseHeight);
	    	var pointX = caseX + (caseWidth/2);
	    	var pointY = caseY + (caseHeight/2);
	    	
	    	if (i == 0) var stringNote = paper.text(pointX - stringNotewidth, pointY, this.strings[j]);	

			var neck = paper.rect(caseX, caseY, caseWidth, caseHeight);
	        neck.attr("stroke", caseBorderColor);
	        neck.attr("fill", "#f9fafa");

	        var aPosition = positions.get(j,i);
	        if (aPosition != null) {
				var circle = paper.circle(pointX, pointY, pointRadius);					
				var color = null;

				if(aPosition.note.rang==1) color = "#F60505"; else  color = "#000000";
			
				circle.attr("fill", color);					
				circle.attr("stroke", pointBorderColor);					
				var rang = paper.text(pointX, pointY-1, aPosition.note.interval);
				rang.attr("fill", "#FFFFFF");				
			};

	      };
	      // ajout des reperes de tranche
	      if (j == positions.strings.length) {
			if (tabReperes.indexOf(i)>=0) {
				var repere = paper.circle(pointX, pointY + ( caseHeight * 0.75 ) , repereRadius);
				repere.attr("fill", repereColor);					
				repere.attr("stroke", repereBorderColor);				
		    };
	      };	      
	   	};		
	}
});


var mixolydien = new Gamme([2,2,1,2,2,1], "mixolydien");
var dorien = new Gamme([2,1,2,2,2,1], "dorien");
var pentaJaponais = new Gamme([2,1,4,2], "pentaJaponais");


var guitare = new Instru(['E','B','G','D','A','E']);
/*console.log('Instru - mixolydien');
Instru.renderTextPositions('G', mixolydien);*/
/*console.log('\nInstru - pentaJaponais');
Instru.renderTextPositions('C', pentaJaponais);*/


var basse = new Instru(['G','D','A','E']);
/*console.log('\nbasse - mixolydien');
basse.renderTextPositions('G', mixolydien);*/
/*console.log('\nbasse - pentaJaponais');
basse.renderTextPositions('C', pentaJaponais);*/