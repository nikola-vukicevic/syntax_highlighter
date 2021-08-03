function formatiranjeListe(lista, rezim) {
	let s = "";
	
	for(let i = 0; i < lista.length; i++) {
		
		//if(lista[i][1] !== false) continue;
		if(lista[i][0] === "")    continue;

		if(rezim == "html") {
			s += `<span class='token ${lista[i][2]}' title='${lista[i][2]}'>${lista[i][0]}</span>`
			continue;
		}

		if(rezim == "tech") {
			s += `[${lista[i][0]}] - ${lista[i][2]}\n`;
			s += `-------------------------------------\n`;
			continue;
		}
	}

	return s;
}

function rastavljanje(tekst, regex) {
	return tekst.split(regex);
}

function proveraListe(lista, regex, token) {
	for(let i = 0; i < lista.length; i++) {
		if(lista[i].match(regex)) {
			lista.splice( i, 1, [ lista[i], true,  token ] );
		}
		else {
			lista.splice( i, 1, [ lista[i], false, "tekst" ] );
		}
	}
}

function proveraTokena(lista, regex, token) {
	for(let i = 0; i < lista.length; i++) {
		if(lista[i][1] == false) {
			
			let novaLista = rastavljanje(lista[i][0], regex);
			
			proveraListe(novaLista, regex, token);
			
			for(let j = 0; j < novaLista.length; j++) {
				lista.splice(i + j, (j == 0)? 1 : 0, novaLista[j]);
			}
		}
	}
}

function binarnaPretraga(element, niz) {
	let le  = 0, de = niz.length - 1;
	let ind = parseInt(Math.floor((le + de) * 0.5));
	//console.log(`nizDuzina: ${niz.length}`)

	while(le <= de) {
		
		//console.log(`element: ${element}`)
		//console.log(`niz[ind]: ${niz[ind]}`)
		
		if(element == niz[ind]) {
			return true;
		}

		let char_el  = element.charCodeAt(0);
		let char_niz = niz[ind].charCodeAt(0);

		if(char_el < char_niz) {
			de = ind - 1;
		}
		else {
			le = ind + 1;
		}

		ind = parseInt(Math.floor((le + de) * 0.5)); 
	}

	return false;
}

function prepravljanjeTokena(lista, nizSpecijalnih, token) {
	for(let i = 0; i < lista.length; i++) {
		
		if(lista[i][1] == true) continue;
		if(lista[i][0] == "")   continue;

		if(nizSpecijalnih.includes(lista[i][0])) {
		//if(binarnaPretraga(lista[i][0], nizSpecijalnih)) {
			lista[i][1] = true;
			lista[i][2] = token;
		}
	}
}

function proveraListeTokena(listaTokena, listaDefinicija) {
	listaDefinicija.forEach(e => {
		proveraTokena(listaTokena, e[0], e[1]);
	});
}

function proveraListeZaTagove(lista, regex, token, tokenDefault) {
	for(let i = 0; i < lista.length; i++) {
		if(lista[i].match(regex)) {
			lista.splice( i, 1, [ lista[i], true, token ] );
		}
		else {
			lista.splice( i, 1, [ lista[i], true, tokenDefault ] );
		}
	}
}

function rastavljanjeOtvarajucihTagova(lista, regex, token, tokenDefault, provera) {
	for(let i = 0; i < lista.length; i++) {
		if(lista[i][2] == provera) {

			let novaLista = rastavljanje(lista[i][0], regex);
			
			proveraListeZaTagove(novaLista, regex, token, tokenDefault);
			
			for(let j = 0; j < novaLista.length; j++) {
				lista.splice(i + j, (j == 0)? 1 : 0, novaLista[j]);
			}
		}
	}
}

function inicijalizacijaListeTokena(tekst) {
	return [
		[ tekst, false, "tekst" ]
	];
}
