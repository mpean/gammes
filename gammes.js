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
	intervalsGamme : ['R','2b','2','3b','3','4','5b','5','6b','6','7','R','2b','2','3b','3','4','5b','5','6b','6','7'],

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
		//console.log(positionNotes);
		 this.positionNotes = positionNotes;
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
		
		};
		 //aPositions.renderRaphaelPart();
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
		
		//console.log(tabFret);
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
	renderCanvasPositions : function(note, gamme,x,y){
		var width = 800;
		var height = 140;
		var positions =  this.positions(note, gamme);			
		var tabFrets = this.calculateFrets();
		
		var c = document.getElementById("myCanvas");
		var ctx = c.getContext("2d");		
		//ctx.translate(0.5, 0.5);
		
		var stringNotewidth = 20;
		var caseXWidth = 60;
		var case0Width = 20;
		var caseHeight = 20;
		var caseBorderColor = "#000";
		var pointRadius = 8;
		var pointColor = "#0392cf";
		var pointToniqueColor = "#ee4035";
		var pointBorderColor = "#444444";
		var textColor = "#FFFFFF";
		var neckColor = "#f5f5f5";
		var headHeight = 5;
			
		// pour chaque demi-ton d'un octave
	    for (var i = 0; i < 12; i++) {
			var caseWidth = tabFrets[i].width;						
			var caseX = 20 + tabFrets[i].pos;
			
		  // pour chaque position de chaque corde
	      for (var j = 0; j < positions.strings.length; j++) {	      		      		    		    	
	    	if (i == 0) caseWidth = case0Width;

	    	var caseY = headHeight+(j*caseHeight);
	    	var pointX = caseX + (caseWidth/2);
	    	var pointY = caseY + (caseHeight/2)+1;
	    	
				ctx.font="small-caps 10px Arial";
				ctx.fillStyle=caseBorderColor;
				if (i == 0) ctx.fillText(this.strings[j],pointX - stringNotewidth -2, pointY +1);
		
				// dessin des cases
				ctx.beginPath();
				ctx.fillStyle = neckColor;
				ctx.strokeStyle=caseBorderColor;
				ctx.rect(caseX, caseY, caseWidth, caseHeight);
				ctx.fill();
				ctx.stroke();
				

				// desssin des positions
	        	var aPosition = positions.get(j,i);
				if (aPosition != null) {

				  	ctx.beginPath();
				  	ctx.arc(pointX, pointY-1,pointRadius,0,2*Math.PI);

					// definition de la couleur de la position
					var color = null;
					if(aPosition.note.rang==1) color = pointToniqueColor; else  color = pointColor;

					ctx.fillStyle = color;
					ctx.strokeStyle = pointBorderColor;
					ctx.stroke();
					ctx.fill();

					// texte de la position
					ctx.fillStyle=textColor;
				   ctx.fillText(aPosition.note.interval,pointX-3.5, pointY+2);
				  
			};

	      };
	      // ajout des reperes de tranche
			var tabReperes = [3,5,7,9];
			var repereRadius = 1.5;
			var repereColor = "#000";
			var repereBorderColor = "#FFF";
	      if (j == positions.strings.length) {
				 if (tabReperes.indexOf(i)>=0) {
					ctx.beginPath();
					ctx.strokeStyle=repereBorderColor;
					ctx.fillStyle = repereColor;
					ctx.arc(pointX, pointY + ( caseHeight * 0.75 ) , repereRadius,0,2*Math.PI);
					ctx.stroke();
					ctx.fill();
				  };
	      };	      
	  };		 
		
	}
});


var mixolydien = new Gamme([2,2,1,2,2,1], "mixolydien");
var dorien = new Gamme([2,1,2,2,2,1], "dorien");
var aeolien = new Gamme([2,1,2,2,1,2], "aeolien");
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

var selectNotes = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
var selectGammes = [mixolydien,dorien,aeolien,pentaJaponais];
var yourNote = 'C';
