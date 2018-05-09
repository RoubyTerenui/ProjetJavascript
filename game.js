//Chargement des ressources graphiques
var grass = new Image();
grass.src = "Images/grass.png";
var grave = new Image();
grave.src = "Images/grave.png";
var grave2 = new Image();
grave2.src = "Images/grave2.png";
var lifeG = new Image();
lifeG.src = "Images/jaugedeviepleine.png";
var lifeY = new Image();
lifeY.src = "Images/jaugedeviemilieu.png";
var lifeR = new Image();
lifeR.src = "Images/jaugedevieDanger.png";
var won = new Image();
won.src = "Images/won.png";
var lost = new Image();
lost.src = "Images/lost.png";
grass.onload = loadGrass;
grave.onload = loadGrave;
grave2.onload = loadGrave2;
var zombie1 = new Image();
zombie1.src = "Images/zombie1.png";
var zombie2 = new Image();
zombie2.src = "Images/zombie2.png";
var zombie3 = new Image();
zombie3.src = "Images/zombie3.png";
var zombie4 = new Image();
zombie4.src = "Images/zombie4.png";
var sang = new Image();
sang.src = "Images/sang.png";

//Contient les informations relatives au joueur (Points de vie et score)
class Player{
	constructor(){
	this.life=10;
	this.point=0;
	}
}

//Classe permettant de gérer les différents types de zombies (apparence, points de vie, vitesse et score rapporté) et leurs caractéristiques en commun
class Zombie {
	constructor(type, sx, sy, swidth, sheight, x, y, width, height) {
		this.type = type;
		this.sx = sx;
		this.sy = sy;
		this.swidth = swidth;
		this.sheight = sheight;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.lifestate="full";
		if (type==zombie1){
			this.life=1;
			this.speed=24;
			this.point=1;
		}
		if (type==zombie2){
			this.life=2;
			this.speed=15;
			this.point=3;
		}
		if (type==zombie3){
			this.life=3;
			this.speed=6;
			this.point=5;
		}
		if (type==zombie4){
			this.life=25;
			this.speed=4;
			this.point=30;
		}
	}
	
}

//Gestion du son
function play(idPlayer) {
    var sound = document.getElementById(idPlayer);
	if (sound.paused){		
		sound.play();
	}
	else{
		sound.currentTime=0;
	}
}

// classe Pour les differents type de tombes

class Grave {
	constructor(type,x,y,time) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.time=time;
	}
}
var player=new Player();
var cs = document.getElementById("cv");
var ctx = cs.getContext("2d");
var bossappeared=false;//Boolean indiquant si le boss est apparu ou pas
// Variable indiquant l'état chargement des images
var isGrassLoaded = false;
var isGraveLoaded = false;
var isGrave2Loaded = false;
// Liste de Zombie indiquant les zombies vivant présent dans le canvas et leurs états
var zombies = [];
// Liste de tombe qui se vide au bout de 10 mouvement de zombie
var graves=[];


//Gestion de la barre de vie des zombies pour chacun des types de zombie
function stateLife(zombies,i){
	if (zombies[i].type==zombie1){
		if(zombies[i].life==1){
			zombies[i].lifestate="full";//La barre de vie du zombie est full
		}
		if (zombies[i].life>0.5){//La barre de vie du zombie passe à Midlife
			zombies[i].lifestate="middle";
		}
		
		if (zombies[i].life>0 && zombies[i].life/25<0.5){//La barre de vie du zombie passe à critique
			zombies[i].lifestate="danger";
		}

	}
	
	if (zombies[i].type==zombie2){
		if(zombies[i].life/2==1){//La barre de vie du zombie est full
			zombies[i].lifestate="full";
		}
		if (zombies[i].life/2>0.5){//La barre de vie du zombie passe à Midlife
			zombies[i].lifestate="middle";
		}
		
		if (zombies[i].life/2>0 && zombies[i].life/25<0.5){//La barre de vie du zombie passe à critique
			zombies[i].lifestate="danger";
		}
	}
	if (zombies[i].type==zombie3){
		if(zombies[i].life/3==1){//La barre de vie du zombie est full
			zombies[i].lifestate="full";
		}
		if (zombies[i].life>1.5){//La barre de vie du zombie passe à Midlife
			zombies[i].lifestate="middle";
		}
		
		if (zombies[i].life>0 && zombies[i].life<1.5){//La barre de vie du zombie passe à critique
			zombies[i].lifestate="danger";
		}
	}
	if (zombies[i].type==zombie4){
		if(zombies[i].life/25==1){//La barre de vie du zombie est full
			zombies[i].lifestate="full";
		}
		if (zombies[i].life/25>0.5){//La barre de vie du zombie passe à Midlife
			zombies[i].lifestate="middle";
		}
		
		if (zombies[i].life/25>0 && zombies[i].life/25<0.5){//La barre de vie du zombie passe à critique
			zombies[i].lifestate="danger";
		}
	}
	if (zombies[i].life==0){
		player.point+=zombies[i].point;//On rajoute les points associés au zombie au compteur de point du joueur a sa mort
		zombies.splice(i,1);//On supprime le zombie de la liste si il est mort
	}
}	

//Gestion des clics et des actions associées si on touche un zombie
function onclick_page(event){
	event=event|| window.event;
	play("attack");//Bande son joué au clic sur la page(Gunshot)
	// Position de la souris dans le canvas avec scroll et offset pour toujours avec la position dans le canvas même lorsque l'on examine 
	// le code ou que l'on defile vers le bas
	var diffx = event.clientX -(document.body.scrollLeft || document.documentElement.scrollLeft)-document.getElementById("cv").offsetLeft;
	var diffy = event.clientY + (document.body.scrollTop || document.documentElement.scrollTop)-document.getElementById("cv").offsetTop;
	for(var i=0;i<zombies.length;i++){//On regarde si la souris se situe sur un zombie
		if (contains(zombies[i].x,zombies[i].y,zombies[i].height,zombies[i].width,diffx,diffy,8,8)){
			play("death");
			zombies[i].life-=1;
			stateLife(zombies,i);
			ctx.drawImage(sang, 0, 0, 192, 192, diffx-64, diffy-64, 128, 128)
			return;
		}
	}
	return;
};

//Gestion du chargement du terrain et des tombes avec les 3 conditions qui risque de poser probléme lors du drawImage
var loadGrass = function () {
	isGrassLoaded = true;
	canDisplay();
};
var loadGrave = function () {

	isGraveLoaded = true;
	canDisplay();
};
var loadGrave2 = function () {
	isGrave2Loaded = true;
	canDisplay();
};
// Si les variables de chargements sont a True on trace le fond
var canDisplay = function () {
	if(isGrassLoaded&&isGraveLoaded&&isGrave2Loaded){
		drawGrass();
	}
}
// Tracé du Background du Canvas
var drawGrass = function () {
	for (i = 0; i < 2; i++){
		for (j = 0; j < 4; j++){
			ctx.drawImage(grass, 400*i, 400*j);
		}
	}
};


//Affichage des zombies
var drawZombie = function (zomb,sizexy) {
	var canSpawn = false;
	while(!canSpawn){
		canSpawn = true;
		var h = Math.random();
		h *= 84;
		h = Math.round(h);
		h+=16;//Pour éviter que les zombies spawn dans les bords
		
		var w = Math.random();
		w *= 536;
		w = Math.round(w);
		w+=16;//Pour éviter que les zombies spawn dans les bords
		
		for(var i= 0; i < zombies.length; i++){
			if(contains(zombies[i].x, zombies[i].y, zombies[i].width, zombies[i].height, w, h, sizexy, sizexy)){
				canSpawn = false;
			}
		}
	}
	var graveType=Math.random();
	graveType=Math.round(graveType);
	acutalTime=new Date().getTime();//Choix aléatoire sur les 2 types de Tombes possible
	if (graveType==0){
		ctx.drawImage(grave,w,h);
		graves.push( new Grave(grave,w,h,actualTime));
	}
	if (graveType==1){
		ctx.drawImage(grave2,w,h);
		graves.push( new Grave(grave2,w-10,h-25,actualTime));
	}
	ctx.drawImage(zomb, 0, 0, 32, 32, w, h, sizexy, sizexy);
	ctx.drawImage(lifeG ,0,0,32,32,w,h-5,64,12);
	zombies.push( new Zombie(zomb, 0, 0, 32, 32, w, h, sizexy, sizexy));// Ajout du Zombie qui vient de spawn à la liste de Zombie
};

//Gestion de l'apparition des types de zombies associés aux différentes phases du jeu
var spawnZombie = function (i) {
	if (i=="phase1"){//Gestion de la Phase de jeu où l'on se situe
		drawZombie(zombie1,64);
	}
	if (i=="phase2"){//Gestion de la Phase de jeu où l'on se situe
		var zombietype = Math.random();
		zombietype *= 1;
		zombietype = Math.round(zombietype);
		if (zombietype==0){//Les différents types de Zombie qui peuvent apparaitre
			drawZombie(zombie1,64);
		}
		if (zombietype==1){//Les différents types de Zombie qui peuvent apparaitre
			drawZombie(zombie2,64);
		}
	}
	if (i=="phase3"){//Gestion de la Phase de jeu où l'on se situe
		var zombietype = Math.random();
		zombietype *= 2;
		zombietype = Math.round(zombietype);//Choix aléatoire du type de zombie
		if (zombietype==0){//Les différents types de Zombie qui peuvent apparaitre
			drawZombie(zombie1,64);
		}
		if (zombietype==1){//Les différents types de Zombie qui peuvent apparaitre
			drawZombie(zombie2,64);
		}
		if (zombietype==2){//Les différents types de Zombie qui peuvent apparaitre
			drawZombie(zombie3,96);
		}
	}
	if (i=="phase4"){//Gestion de la Phase de jeu où l'on se situe
		var zombietype = Math.random();
		zombietype *= 2;
		zombietype = Math.round(zombietype);//Choix aléatoire du type de zombie(même types que pour la phase 3)
		if (zombietype==0){//Les différents types de Zombie qui peuvent apparaitre
			drawZombie(zombie1,64);
		}
		if (zombietype==1){//Les différents types de Zombie qui peuvent apparaitre
			drawZombie(zombie2,64);
		}
		if (zombietype==2){//Les différents types de Zombie qui peuvent apparaitre
			drawZombie(zombie3,96);
		}
	}
};

// Gestion du mouvement des zombies vers le bas de l'écran
var actualTime=new Date().getTime();
var moveZombies = function () {
	ctx.clearRect(0, 0, 600, 800);
	drawGrass();
	for (var j=0;j< graves.length;j++){
		if (graves!=[]){//Gestion du temps Avant lequel les tombes doivent disparaitre
			actualTime=new Date().getTime();
			if ((actualTime-graves[j].time)>=10000){
				graves.splice(j,1);
			}
			ctx.drawImage(graves[j].type,graves[j].x,graves[j].y);
		}
	}
	for(var i= 0; i < zombies.length; i++){
		// Conditions detectant l'arrivée d'un zombie a la limite du terrain
		if (zombies[i].y>=773)
		{
			zombies.splice(i,1);
			player.life-=1;
		}
		zombies[i].y += zombies[i].speed;//Mouvement en fonction 
		if (zombies[i].sx<64){//Decomposition du mouvement passage au mouvement suivant
			zombies[i].sx+=32;
		}
		if (zombies[i].sx==64){// Retour au premier sprite
			zombies[i].sx=0;
		}
		ctx.drawImage(zombies[i].type, zombies[i].sx, zombies[i].sy, zombies[i].swidth, zombies[i].sheight, zombies[i].x, zombies[i].y, zombies[i].width, zombies[i].height);
		if (zombies[i].lifestate=="full"){
			ctx.drawImage(lifeG, zombies[i].sx, zombies[i].sy, zombies[i].swidth, zombies[i].sheight, zombies[i].x, zombies[i].y-5, zombies[i].width, 12);
		}
		if (zombies[i].lifestate=="middle"){
			ctx.drawImage(lifeY, zombies[i].sx, zombies[i].sy, zombies[i].swidth, zombies[i].sheight, zombies[i].x, zombies[i].y-5, zombies[i].width/2, 12);
		}
		if (zombies[i].lifestate=="danger"){
			ctx.drawImage(lifeR, zombies[i].sx, zombies[i].sy, zombies[i].swidth, zombies[i].sheight, zombies[i].x, zombies[i].y-5, zombies[i].width/4, 12);
		}

	}
};

var contains = function(x1, y1, width1, height1, x2, y2, width2, height2){ //Verifie si deux rectangles ont une intersection pour la gestion des collisions (i.e ne pas faire apparaitre un zombie par dessus un autre)
	if(((x2 + width2 < x1)||(x2 > x1 + width1))||((y2 + height2 < y1)||(y2 > y1 + height1))){
		return false;
	}
	else{
		return true;
	}
}




window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var start = null;
var firstTimestamp = new Date().getTime(); // On obtient le timestamp avant l'exécution
var secondTimestamp = new Date().getTime(); // On obtient le timestamp aprés chaque execution

//Gestion des différents événements relatifs au temps (apparition de zombies, phases)
var compteurInc = function (timestamp) {
	secondTimestamp=new Date().getTime(); // On obtient le timestamp avant l'exécution
	if (secondTimestamp-firstTimestamp<=200000 && player.life>0){ //Si la partie n'est pas terminée
		if (start === null) {
			start = {
				spawn: timestamp,
				move: timestamp
			};
		}
		if (secondTimestamp-firstTimestamp>=0 && secondTimestamp-firstTimestamp<=30000) //Phase 1
		{
			if (timestamp - start.spawn >= 2000) {
				start.spawn = timestamp;
				spawnZombie("phase1");
			}
		}
		if (secondTimestamp-firstTimestamp>=30000 && secondTimestamp-firstTimestamp<=100000) //Phase 2
		{
			if (timestamp - start.spawn >= 2000) {
				start.spawn = timestamp;
				spawnZombie("phase2");
			}
		}
		if (secondTimestamp-firstTimestamp>=100000 && secondTimestamp-firstTimestamp<=140000) //Phase 3
		{
			if (timestamp - start.spawn >= 2000) {
				start.spawn = timestamp;
				spawnZombie("phase3");
			}
		}
		if (secondTimestamp-firstTimestamp>=140000)//Phase 4
		{
			if (timestamp - start.spawn >= 1000) {//Passe à 1 seconde de spawn
				start.spawn = timestamp;
				if (!bossappeared){
					drawZombie(zombie4,128);
					var sound2 = document.getElementById("spawn");
					if (sound2.played){		
						sound2.pause();
						sound2.volume=1;
						
					}
					bossappeared=true;
					var soundBoss=document.getElementById("BossSpawn")
				}
				spawnZombie("phase4");
			}
		}
		if (timestamp - start.move >= 200) {
			start.move = timestamp;
			moveZombies();
		}
		resultat=200000-(secondTimestamp-firstTimestamp);
		//seconde
		var s = Math.floor(resultat / 1000) % 60;
		//minutes
		var m = Math.floor(resultat / 60000) % 60;
		//affichage des éléments d'information Vie Point et Temps restant sur le Canvas
		var chaine = m+":"+s;
		ctx.font = "20pt Calibri,Geneva,Arial";
		ctx.fillStyle = "rgb(255,69,0)";
		ctx.fillText("Point de vie :"+player.life, 425, 20);
		ctx.fillText("Temps restant :"+chaine, 0, 20);
		ctx.fillText("Score :"+player.point, 275, 780);
		requestAnimationFrame(compteurInc);
	}
	else {
		var sound2 = document.getElementById("spawn");
		if(player.life>0){//Si la partie est gagnée
			ctx.drawImage(won,0,0);
		}
		else{//Sinon, si la partie est perdue
			ctx.drawImage(lost,0,0);
			play("bandeSon_Fin");
		}
	}
};

setTimeout(function() {
	firstTimestamp = new Date().getTime();
	play("spawn");
	requestAnimationFrame(compteurInc);
}, 1000);
