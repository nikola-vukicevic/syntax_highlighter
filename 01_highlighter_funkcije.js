/* -------------------------------------------------------------------------- */
// Datoteka sa glavnim funkcijama - detaljnija objašnjenja u nastavku
// Copyright (c) 2021. Nikola Vukićević
/* -------------------------------------------------------------------------- */
/* eslint-disable
   eqeqeq
*/
/* -------------------------------------------------------------------------- */
// Lekser:
/* -------------------------------------------------------------------------- */
function daLiJeWhiteSpace(z) {
	return z == " " || z == "\t" || z == "\n";
}
/* -------------------------------------------------------------------------- */
function daLiJeCifra(z) {
	return z[0] >= '0' && z[0] <= '9';
}
/** ----------------------------------------------------------------------------
Svaki put kada se promeni vrsta tokena koji se učitava,
string se premešta u listu
*/
function praznjenjeStringova(str, lista, definicijaJezika) {
	if (str.s == "") return; // uslov je ovde, da ne bi bio na "100" mesta
	                        // u ostalim funkcijama :)
	if (str.i == 0 || str.i == 2) { // obični znakovi i brojevi
		lista.push( [ str.s , str.nazivi[str.i] ] );
		str.s = "";	
		return;
	}

	if (str.i == 1) { // specijalni znakovi
		while (str.s != "") {
			ubacivanjeSpecToken(str, lista, definicijaJezika);
		}
		return;
	}
}
/* -------------------------------------------------------------------------- */
// whitespace-ovi, pojedinačno, idu direktno u listu

function obradaLekserWhiteSpace(z, str, lista, definicijaJezika) {
	praznjenjeStringova(str, lista, definicijaJezika);
	lista.push( [ z , "white_space" ] );
}
/** ----------------------------------------------------------------------------
Brojevi se učitavaju kao brojevi, ako stoje samostalno,
ili kao deo niske običnih znakova, ako je ta niska već započeta
*/
function obradaLekserBroj(z, str, lista, definicijaJezika) {
	if (str.i == 1  || (str.i == 0 && str.s == ""))	{
		praznjenjeStringova(str, lista, definicijaJezika);
		str.s += z;
		str.i = 2;
		return;
	}

	// Ovde se zapravo dešavaju dve (različite) stvari:
	// Ako proradi prvi deo if-a, cifra se smešta u broj
	// Ako proradi drugi deo if-a (unutrašnja zagrada),
	// cifre se smeštaju u string sa običnim znakovima i neće
	// biti označene CSS klasom za brojeve

	if (str.i == 2 || (str.i == 0 && str.s != "")) {
		str.s += z;
		return;
	}
}
/** --------------------------------------------------------------------------
 * - Escape sekvence se direktno prosleđuju u listu
 * - Kontekst dobijaju preko parsera
 * Postoji i if koji, "eto", 
 * da budemo fini", 
 * proverava da li (zapravo) 
 * postoji sledeći znak
*/
function obradaLekserEscapeSekvenca(z, str, lista, definicijaJezika, i, tekst) {
	praznjenjeStringova(str, lista, definicijaJezika);
	
	if (i < tekst.length - 1)  {
		lista.push( [ tekst[i] + tekst[i + 1] , "escape_sekvenca" ] );
		++i;
	}
	else {
		lista.push( [ tekst[i] , "escape_sekvenca" ] );
	}
	
	return i;
}
/** ----------------------------------------------------------------------------
Obični znakovi smeštaju se direktno u nisku
*/
function obradaLekserObicanZnak(z, str, lista, definicijaJezika) {
	if (str.i != 0) praznjenjeStringova(str, lista, definicijaJezika);
	str.i  = 0;
	str.s += z;
}
/* -------------------------------------------------------------------------- */
/* ---------------------------------------- */ 
// Prepoznavanje specijalnih tokena
/* ---------------------------------------- */ 

// Specijalni tokeni se proveravaju u grupama, tako da je dužina niske
// definisana preko objekta definicijaJezika, shodno tome koliko najviše
// znakova može sadržati operator (ili neka druga specijalna niska)
// u datom jeziku (recimo "&&<" u C-u, "<!--" u HTML-u i slično).
// Ako se pronađe niska koja odgovara maksimalnoj dužini i sadrži
// prepoznati token (operator, komentar i sl), prosleđuje se u listu,
// dok u suprotnom funkcija analiza_str_s_Substringova, proverava
// podniske (da bi u niski "/**" bila prepoznata podniska "/*",
// kao početak blok komentara).
// U "najgorem slučaju" (za šta je zadužena funkcija ubacivanje_s_0),
// ako ostane podniska dužine 1, biće ubačena u listu i biće joj
// dodeljen tip (jer se specijalni tokeni dužine  veće od 1,
// sastoje samo iz znakova koji i inače imaju specijalno značenje).

function ubacivanje_s_0(str, mapa, lista) {
	let rez = mapa.get(str.s[0]);
	lista.push( [ str.s[0] , rez ] );
	str.s = str.s.substring(1, str.s.length);
}
/* -------------------------------------------------------------------------- */
function analiza_str_s_Substringova(str, mapa, lista) {
	let g2 = str.s.length;
	let g1 = g2 - 1;

	if (g1 == 0) ubacivanje_s_0(str, mapa, lista);

	while (g1 >= 1) {
		let x = str.s.substring(0, g1);
		let y = str.s.substring(g1, g2);
		
		let rez = mapa.get(x);

		if (rez != null) {
			lista.push( [ x , rez] );
			str.s = y;
			return;
		}

		g1--;
	}
}
/** ----------------------------------------------------------------------------
funkcija ubacivanjeSpecToken aktivira se svaki put kada se učita niska
specijalnih znakova čija dužina odgovara maksimalnoj dužini specijalne
niske za dati jezik, ili, kada se promeni kontekst učitavanja (kada se
sa specijalnih znakova pređe na obične znakove, ili cifre).
*/
function ubacivanjeSpecToken(str, lista, definicijaJezika) {
	let mapa = definicijaJezika.lekserTokeni;
	let rez  = mapa.get(str.s);
	
	if (rez) {
		lista.push( [ str.s, rez] );
		str.s = "";
	}
	else {
		analiza_str_s_Substringova(str, mapa, lista);
	}
}
/** ----------------------------------------------------------------------------
Osnovna funkcija za obradu specijalnih znakova (obradaLekserSpecZnak),
proverava da li je vreme za slanje niske specijalnih znakova na obradu
(ako je niska kraća od najdužeg operatora, specijalni znak će biti
dodat u nisku i onda se čeka: ili da dužina dostigne maks. dozvoljenu
dužinu, ili da prelazak na obične znakove ili cifre, pokrene analizu
niske specijalnih znakova).
*/
function obradaLekserSpecZnak(z, str, lista, definicijaJezika) {
	if (str.i != 1) praznjenjeStringova(str, lista, definicijaJezika);
	str.i = 1;
	
	if (str.s.length < definicijaJezika.maksDuzinaSpajanje) {
		str.s += z;
	}
	else {
		ubacivanjeSpecToken(str, lista, definicijaJezika);
		str.s += z;
	}
}
/* -------------------------------------------------------------------------- */
// Lekser "opšti" je označen kao takav, zato što (u drugoj datoteci) postoji
// verzija leksera koja funkcioniše preko regularnih izraza.
// Opšti lekser je DIY rešenje u skripti koje se koristi za većinu jezika,
// ali je za neke jezike/sintakse, kao što su assembler, markup i regex,
// lekser koji je implementiran preko regularnih izraza mnogo
// praktičnije rešenje.
// Opšti lekser jednostavno prolazi kroz tekst, znak-po-znak, i poziva gornje
// funkcije u skladu sa tipom znaka koji se ispituje
// Funkcija vraća listu tokena.
/* eslint-disable
   max-lines-per-function
*/
function lekserOpsti(tekst, definicijaJezika) {
	let lista = [];
	let str   = {
		i: 0,
		s: "",
		nazivi: [
			""     , // 0 - običan znak - trba da bude prazan string - zbog parsera
			""     , // 1 - specijalni znak, klasa se dodeljuje preko mape
			"broj" , // 2 - broj dobija klasu preko leksera
		]
	}

	for (let i = 0; i < tekst.length; i++) {
	
		let z = tekst[i];

		if (daLiJeWhiteSpace(z)) {
			obradaLekserWhiteSpace(z, str, lista, definicijaJezika);
			continue;
		}

		if (daLiJeCifra(z)) {
			obradaLekserBroj(z, str, lista, definicijaJezika);
			continue;
		}
		
		if (z == "\\") {
			i = obradaLekserEscapeSekvenca(z, str, lista, definicijaJezika, i, tekst);
			continue;
		}

		let rez = definicijaJezika.lekserTokeni.get(z);

		if (rez != null) {
			obradaLekserSpecZnak(z, str, lista, definicijaJezika);
			continue;
		}

		obradaLekserObicanZnak(z, str, lista, definicijaJezika);
	}

	praznjenjeStringova(str, lista, definicijaJezika);
	return lista;
}

/* -------------------------------------------------------------------------- */
// Parser:
/* -------------------------------------------------------------------------- */

// Parser obrađuje tokene u zavisnosti od konteksta (nije pravi parser,
// ali ćemo biti praktični i tako ga zvati), a konteksti du definisani
// preko objekta definicijaJezika (koji je pripisan svakom od jezika)
// određeni specijalni tokeni menjaju kontekst i definišu ponašanje
// parsera u skladu sa tim (recimo, token "*/" otvara kontekst blok
// komentara, što nalaže parseru da sve dolazeće tokene označava)
// odgovarajućom CSS klasom, sve dok se ne pojavi token "*/", koji
// postavlja parser u prethodni kontekst
// Parser prvo proverava da li se token nalazi u listi tokena koji
// odgovaraju datom kontekstu, a zatim:
//     - ako je token prepoznat (u datom kontekstu), vrši se njegova
//       obrada (sam token se označava odgovarajućom CSS klasom i
//       se da li dati token okida promenu konteksta)
//     - ako token nije prepoznat, proverava se da li se dati token
//       nalazi u listama specijalnih tokena (rezervisane reči, standardne
//       klase i sl), s tim da su liste specijalnih tokena definisane u
//       zavisnosti od konteksta.
//           - ako je token pronađen u listi specijalnih tokena, dodeljuje
//             mu se klasa iz liste specijalnih tokena
//           - ako token nije prepoznat u listi specijalnih tokena,
//             dodeljuje mu se podrazumevana klasa za dati ontekst

function obradaPrepoznatogTokena(token, lista, parser, definicijaJezika) {
	let uslov = false;
	
	if (parser.rez[1] === true ) {
		if (parser.kontekst == 101) uslov = true;		
		parser.stek.pop();
		
		/* ----- prebacivanje stringa s u novu listu ----- */
		
		if (parser.s != "") {
			parser.novaLista.push( [ parser.s , parser.klasa ] );
			parser.s = "";
		}
	}

	if (parser.rez[0] === true) {
		parser.stek.push(parser.rez[2]);

		/* ----- prebacivanje stringa s u novu listu ----- */

		if (parser.s != "") {
			parser.novaLista.push( [ parser.s , parser.klasa ] );
			parser.s = "";
		}
	}
	
	/* ---- Preuzimanje informacija za trenutni kontekst ---- */

	parser.kontekst      = parser.stek[parser.stek.length - 1];
	parser.spajanje      = definicijaJezika.parserPrepravaljanje.get(parser.kontekst)[0];
	parser.prepravljanje = definicijaJezika.parserPrepravaljanje.get(parser.kontekst)[1];
	parser.klasa         = definicijaJezika.parserPrepravaljanje.get(parser.kontekst)[2];

	if (uslov) {
		parser.prethodni = "a";
	}
	
	/* ----- ubacivanje tokena u novu listu ----- */

	parser.novaLista.push( [ token[0] , parser.rez[3] ] );
}
/* -------------------------------------------------------------------------- */
function parserRegexPush(token, lista, parser, definicijaJezika) {
	parser.stek.push(101);

	/* ----- prebacivanje stringa s u novu listu ----- */

	if (parser.s != "") {
		parser.novaLista.push( [ parser.s , parser.klasa ] );
		parser.s = "";
	}
		
	/* ---- Preuzimanje informacija za trenutni kontekst ---- */

	parser.kontekst      = 101;
	parser.spajanje      = true;
	parser.prepravljanje = true;
	parser.klasa         = "regularni_izraz";
	parser.prethodni     = "+"; 

	parser.novaLista.push( [ "/" , "regularni_izraz" ] );
}
/* -------------------------------------------------------------------------- */
function parserRegexKomentarFix(token, parser) {
	console.log(parser)
	parser.s += '*';
	token[0]  = '/'
}
/* -------------------------------------------------------------------------- */
function parserRegexPop(token, lista, parser, definicijaJezika) {
	parser.stek.pop();

	/* ----- prebacivanje stringa s u novu listu ----- */

	if (parser.s != "") {
		parser.novaLista.push( [ parser.s , parser.klasa ] );
		parser.s = "";
	}
			
	/* ---- Preuzimanje informacija za trenutni kontekst ---- */

	parser.kontekst      = parser.stek[parser.stek.length - 1];
	parser.spajanje      = definicijaJezika.parserPrepravaljanje.get(parser.kontekst)[0];
	parser.prepravljanje = definicijaJezika.parserPrepravaljanje.get(parser.kontekst)[1];
	parser.klasa         = definicijaJezika.parserPrepravaljanje.get(parser.kontekst)[2];
	parser.prethodni     = "+"; 

	parser.novaLista.push( [ "\n" , "white_space" ] );
}
/* -------------------------------------------------------------------------- */
function parserObelezavanjePrethodnogTokena(lista, i, parser) {
	if (lista[i][1] == "operator" || lista[i][1] == "zagrada_obicna_otvorena" || lista[i][1] == "otvorena_zagrada_niz")
			parser.prethodni = "+";
		else
			parser.prethodni = "a";
}
/* -------------------------------------------------------------------------- */
	// rezim: 1 - kopiranje u novu listu; 2 - prepravljanje na licu mesta
function parserObelezavanjeSpecijalnogTokena(token, parser, definicijaJezika, rezim) {
	let specLista = definicijaJezika.parserSpecListe.get(parser.kontekst);

	if (specLista) {
		let specKlasa = specLista.get(token[0]);

		if (specKlasa) {
			if (rezim == 1) {
				parser.novaLista.push( [ token[0] , specKlasa ] );
				parser.prethodni = "+";
			}
			if (rezim == 2) {
				token[1] = specKlasa
			}
			return true;
		}
	}

	return false;
}
/* -------------------------------------------------------------------------- */
function parserUtil(token, lista, i, parser, definicijaJezika){
	if (parser.rez != null) {
		obradaPrepoznatogTokena(token, lista, parser, definicijaJezika);
		return true;
	}

	if (token[1] != "white_space" && parser.kontekst == 0) {
		parserObelezavanjePrethodnogTokena(lista, i, parser);
	}

	if (token[0] == "\n" && parser.kontekst == 101) {
		parserRegexPop(token, parser.novaLista, parser, definicijaJezika);
		return true;
	}	
}
/* -------------------------------------------------------------------------- */
function parserObradaPojedinacnogTokena(lista, indeks, parser, definicijaJezika) {

	let token = lista[indeks];

	/* ----- Pokušaj učitavanja regularnog izraza ----------------------- */

	if (token[0] == "/" || token[0] == "/=") {
		if (definicijaJezika.kontekstZaRegex == parser.kontekst && parser.kontekst == 0 && parser.prethodni == "+") {
			parserRegexPush(token, parser.novaLista, parser, definicijaJezika);
			return indeks;
		}
	}

	// Fiks za situaciju u kojoj se token */ pojavljuje posle
	// tokena / (pri čemu tokenu */ nije prethodio token /*)

	if (token[0] == "*/" && parser.kontekst == 101) {
		console.log(parser)
		// parser.s += '*'
		// token[0]  = '/'
		parserRegexKomentarFix(token, parser)
		return indeks - 1
	}
	
	/* ----- Pokušaj učitavanja generika -------------------------------- */

	if (token[0] == "<" && parser.kontekst == definicijaJezika.kontekstZaGenerike) {
		indeks = parserPokusajUcitavanjaGenerika(parser, indeks, lista, definicijaJezika);
		return indeks;
	}
								
	// Prepoznati token (koji menja, ili ne menja, kontekst), obeležavanje
	// prethodnog tokena i prekidanje režima obeležavanja JS regexa pri
	// prelasku u novi red

	if (parserUtil(token, lista, indeks, parser, definicijaJezika)) return indeks;

	/* ----- Režim spajanja --------------------------------------------- */
	
	if (parser.spajanje) {      // Ako je parser u režimu spajanja
		parser.s += token[0];  // tokena, nema pretrage
		return indeks;         // tokena u specijalnim listama!
	}

	/* ----- Pretraga lista specijalnih tokena -------------------------- */

	if (parserObelezavanjeSpecijalnogTokena(token, parser, definicijaJezika, 1)) return indeks;

	/* ----- Da li se klasa tokena prepravlja ----- */

	if (parser.prepravljanje && token[1] == "") {
		token[1] = parser.klasa;
	} 

	parser.novaLista.push( token );
	return indeks
}
/* -------------------------------------------------------------------------- */
// Parser opšteg tipa je (kao i lekser), označen kao takav, da bi se
// razlikovao od parsera koji odgovara lekseru koji koristi
// regularne izraze

function parserOpsti(definicijaJezika, lista) {
	let parser = {
		novaLista:     [],
		stek:          [ 0 ],
		kontekst:      -1,
		s:             "",
		mapa:          null,
		rez:           null,
		spajanje:      false,
		prepravljanje: false,
		prethodni:     "+",
		klasa:         definicijaJezika.defaultKlasa
	}

	for (let i = 0; i < lista.length; i++) {
		parser.kontekst  = parser.stek[parser.stek.length- 1];
		parser.mapa      = definicijaJezika.parserTokeni.get(parser.kontekst);
		parser.rez       = parser.mapa.get(lista[i][0]);
		
		i = parserObradaPojedinacnogTokena(lista, i, parser, definicijaJezika);
	}

	if (parser.s != "") {
		parser.novaLista.push( [ parser.s , parser.klasa ] );
	}
	
	return parser.novaLista;
}
/* -------------------------------------------------------------------------- */
function parserPraznjenjePomListe(pomLista, lista) {
	pomLista.forEach(e => {
		lista.push(e);
	})
}
/* -------------------------------------------------------------------------- */
function parserPokusajUcitavanjaGenerika(parser, i_pocetni, lista, definicijaJezika) {
	let s        = "<";
	let pomLista = [];
	let nastavak = true;
	pomLista.push(lista[i_pocetni]);
	let i = i_pocetni + 1;

	while (daLiJeWhiteSpace(lista[i][0])) {
		pomLista.push(lista[i]);
		s += lista[i][0]
		i++
	}

	if (lista[i][1] == "") {
		pomLista.push(lista[i]);
		s += lista[i][0];
		i++;	
	}
	else {
		nastavak = false;
		parserPraznjenjePomListe(pomLista, parser.novaLista);
		return i - 1;
	}

	while (nastavak && daLiJeWhiteSpace(lista[i][0])) {
		pomLista.push(lista[i]);
		s += lista[i][0]
		i++
	}

	if (nastavak && lista[i][0] == ">") {
		pomLista.push(lista[i]);
		s += lista[i][0]
		i++;
		parser.novaLista.push( [ s , "generik" ] );
	}
	else {
		console.log(pomLista)
		pomLista.forEach(e => {
			console.log(e)
			let p = parserObelezavanjeSpecijalnogTokena(e, parser, definicijaJezika, 2)
			console.log(p)
		});
		console.log(pomLista)
		parserPraznjenjePomListe(pomLista, parser.novaLista);
		return i - 1;
	}

	return i - 1;
}

/* -------------------------------------------------------------------------- */
function parserPokusajUcitavanjaGenerika_stari(kontekst, i, lista, novaLista, definicijaJezika) {
	let s        = "<";
	let pomLista = [];
	let nastavak = true;
	pomLista.push(lista[i]);
	i++;

	while (daLiJeWhiteSpace(lista[i][0])) {
		pomLista.push(lista[i]);
		s += lista[i][0]
		i++
	}

	if (lista[i][1] == "") {
		pomLista.push(lista[i]);
		s += lista[i][0];
		i++;	
	}
	else {
		nastavak = false;
		parserPraznjenjePomListe(pomLista, novaLista);
		return i - 1;
	}

	while (nastavak && daLiJeWhiteSpace(lista[i][0])) {
		pomLista.push(lista[i]);
		s += lista[i][0]
		i++
	}

	if (nastavak && lista[i][0] == ">") {
		pomLista.push(lista[i]);
		s += lista[i][0]
		i++;
		novaLista.push( [ s , "generik" ] );
	}
	else {
		parserPraznjenjePomListe(pomLista, novaLista);
		return i - 1;
	}

	return i - 1;
}

/* -------------------------------------------------------------------------- */
// Pomoćne funkcije:
/* -------------------------------------------------------------------------- */

function formatiranjeIspisListe(lista, rezim) {
	let s = "";
	let alt1 = false, alt2 = true;

	if (rezim == "rand"){
		alt1  = true;
		rezim = "html"
	}

	for (let i = 0; i < lista.length; i++) {
		
		if (lista[i][0] == "") continue;
		
		let t_0 = lista[i][0]
		              .replace(/</g, "&lt;")
		              .replace(/>/g, "&gt;");
		let t_1 = lista[i][1];
		
		if (rezim == "tech") {
			t_0 = t_0
			          .replace(/\n/g, "ENTER")
			          .replace(/\t/g, "TAB");
			s += `[ |${t_0}| , ${t_1} ]\n---------------------------------\n`;
			continue;
		}

		if (rezim == "html") {
			s += `<span class='token ${t_1+((alt1)?(alt2?1:2):"")}' title='${t_1+((alt1)?(alt2?1:2):"")}'>${t_0}</span>`;
			alt2 = !alt2;
			continue;
		}
	}

	return s;
}
/* -------------------------------------------------------------------------- */
function vremeObradeIspis(t1, naziv) {
	let t2 = performance.now();
	let odziv = t2 - t1 + "ms";
	console.log(`Vreme obrade - ${naziv}: ${odziv}`);
}

/* -------------------------------------------------------------------------- */
//// Obrada ....
/* -------------------------------------------------------------------------- */

function ispisKodaTekst(tekst, poljeZaIspis) {
	let tekstKod = document.createElement('span');
	tekstKod.innerText = tekst.trim();
	tekstKod.classList.add("token");
	tekstKod.classList.add("tekst");
	tekstKod.title = "tekst";
	poljeZaIspis.innerHTML = "";
	poljeZaIspis.appendChild(tekstKod);
}

function ispisKodaShellSym(tekst, poljeZaIspis) {
	poljeZaIspis.innerHTML = tekst.trim();
}
/* -------------------------------------------------------------------------- */
function obradaKoda(tekst, definicijaJezika, poljeZaIspis, rezim) {
	
	/* ---------------------------------------------------------------------- */
	let t1 = performance.now();
	/* ---------------------------------------------------------------------- */

	if (definicijaJezika.naziv == "TXT") {
		tekst = tekst.trim();
		ispisKodaTekst(tekst, poljeZaIspis);
		return;
	}

	if (definicijaJezika.naziv == "ShellSym") {
		tekst = tekst.trim();
		ispisKodaShellSym(tekst, poljeZaIspis);
		return;
	}

	// tekst = tekst.trim() + "\n";
	tekst = tekst
		        .trim()
		        .replaceAll("\t", "    ")
		        + "\n";
	
	let listaTokena = null;

	listaTokena = definicijaJezika.lekser(tekst, definicijaJezika);	
	listaTokena = definicijaJezika.parser(definicijaJezika, listaTokena);
	definicijaJezika.funkcijaPrepravke(definicijaJezika, listaTokena);
		
	poljeZaIspis.innerHTML = formatiranjeIspisListe(listaTokena, rezim);

	/* ---------------------------------------------------------------------- */
	vremeObradeIspis(t1, "Glavna funkcija")
	/* ---------------------------------------------------------------------- */
}
/* -------------------------------------------------------------------------- */
function obradaKodaWorker(tekst, definicijaJezika, poljeZaIspis, rezim) {
	
	/* ---------------------------------------------------------------------- */
	//let t1 = performance.now();
	/* ---------------------------------------------------------------------- */

	if (definicijaJezika.naziv == "TXT") return [
		[ tekst.trim() , "tekst"]
	];

	tekst = tekst.trim() + "\n";
	let listaTokena = null;

	listaTokena = definicijaJezika.lekser(tekst, definicijaJezika);	
	listaTokena = definicijaJezika.parser(definicijaJezika, listaTokena);
	
	/* ---------------------------------------------------------------------- */
	//vremeObradeIspis(t1, "Glavna funkcija")
	/* ---------------------------------------------------------------------- */

	return listaTokena;

}
/* -------------------------------------------------------------------------- */
function funkcijaPrepravkeNull(definicijaJezika, listaTokena) {

} 
/* -------------------------------------------------------------------------- */
function backtrackingDoEntera(listaTokena, i) {
	if (i == 0 || i == 1) return true;
	i--;

	while (i > 0) {
		if (listaTokena[i][1] != "white_space") return false;
		if (listaTokena[i][0] == "\n") return true;
		if (listaTokena[i][0] == "\r") return true;
		i--;
	}
}
/* -------------------------------------------------------------------------- */
function funkcijaPrepravkeShell(definicijaJezika, listaTokena) {
	let i;

	if (listaTokena[0][0] == "$") {
		listaTokena[0][1] = "obicna_naredba";
	}

	if (listaTokena[0][0] == "##") {
		listaTokena[0][0] = "#";
	}

	for (i = 1; i < listaTokena.length; i++) {
		// console.log(listaTokena[i]);

		if (listaTokena[i][0] == "##") {
			listaTokena[i][0] = "#";
			continue;
		}

		if (listaTokena[i][0] == "$" && listaTokena[i - 1][0] == "\n") {
			listaTokena[i][1] = "obicna_naredba";
			continue;
		}

		if (listaTokena[i][1] == "" && backtrackingDoEntera(listaTokena, i)) {
			listaTokena[i][1] = "variable";
			// console.log(listaTokena[i]);
			continue;
		}

		if (i > 0 && listaTokena[i][1] == "putanja" && listaTokena[i - 1][1] == "") {
			listaTokena[i - 1][1] = "putanja";
		}

	};
}
/* -------------------------------------------------------------------------- */
function funkcijaPrepravkeHTML(definicijaJezika, listaTokena) {
	listaTokena.forEach(token => {
		if (token[1] == "tekst")
			// console.log(token)
			token[0] = token[0]
				.replaceAll("&", "&amp;")
				.replaceAll("<", "&lt;")
	});
}
/* -------------------------------------------------------------------------- */
// znak1 - { ili [
// znak2 - } ili ]
function prepravkaJsonUparivanje(znak2, obj) {
	if (obj.stek.length > 0 && obj.stek[obj.stek.length - 1] == znak2) {
		obj.stek.pop();
		return true;
	} else {
		console.error("JSON parse - greška sa uparivanjem na steku!");
		return false;
	}
}
/* -------------------------------------------------------------------------- */
function prepravkaJsonUpravljanjeStekom(znak, obj) {
	if (znak == "{" || znak == "[") {
		obj.stek.push(znak);
		obj.kontekstVrednost = false;
		obj.kontekstSpajanje = false;
	}

	if (znak == "[") {
		obj.kontekstVrednost = true;
	}

	if (znak == "}" && !prepravkaJsonUparivanje("{", obj)) {
		return false;
	}

	if (znak == "]" && !prepravkaJsonUparivanje("[", obj)) {
		return false;
	}

	if (znak == "{" || znak == "[" || znak == "}" || znak == "]") {
		// obj.kontekstVrednost = false;
		// obj.kontekstSpajanje = false;
	}

	return true;
}
/* -------------------------------------------------------------------------- */
function funkcijaPrepravkeJson(definicijaJezika, listaTokena) {
	const obj = {
		kontekstVrednost: false,
		kontekstSpajanje: false,
		klasaNaziv:       "svojstvo_naziv",
		stek:             [ ]
	};

	listaTokena.forEach(token => {
		if (!prepravkaJsonUpravljanjeStekom(token[0], obj)) {
			return;
		}

		// Pojava znaka navoda menja kontekst spajanja:
		if (token[0] == `"`) {
			obj.kontekstSpajanje = !obj.kontekstSpajanje;

			if (obj.kontekstVrednost == true) {
				obj.klasaNaziv = "niska";
			} else {
				// obj.kontekstVrednost = false;
				obj.klasaNaziv = "svojstvo_naziv";
			}

			token[1] = obj.klasaNaziv;

			return;
		}

		// Dve tačke uključuju kontekst upisivanja vrednost:
		if (token[0] == ":") {
			if (obj.kontekstSpajanje == false) {
				obj.kontekstVrednost = true;
				token[1] = "svojstvo_dodela"
			}

			return;
		}
		// Zarez isključuje kontekst upisivanja vrednost:
		if (token[0] == "," && obj.stek[obj.stek.length - 1] != "[") {
			// if (obj.kontekstSpajanje == false) {
				obj.kontekstVrednost = false;
				// token[1] = "svojstvo_dodela"
			// }

			return;
		}
		console.log(obj.kontekstSpajanje)

		if (obj.kontekstSpajanje == true) {
			console.log("spajanje")
			token[1] = obj.klasaNaziv;
		}
	});
}
/* -------------------------------------------------------------------------- */

