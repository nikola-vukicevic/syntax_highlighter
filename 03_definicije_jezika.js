/* -------------------------------------------------------------------------- */
// Copyright (c) 2021. Nikola Vukićević
/* -------------------------------------------------------------------------- */

// Syntax highlighter zasniva se na ideji da svaki jezik bude definisan na
// univerzalan način, preko opštih pravila kao što su specijalni znaci, odnosno
// tokeni i konteksti(komentar, niska i sl, kao i unutrašnji blokovi koda - CSS
// i JS unutar HTML-a, HTML i PHP blokovi u PHP datoteci i sl.
// U tom smislu, "definicija jezika" je skup lista u kojima su
// zapisana navedena pravila.
// 
// Važnije odrednice definicje jezika su:
// 	
// 	- liste specijalnih tokena koje se koriste u lekserima
// 	- liste specijalnih tokena koje se koriste u parserima
// 	- maksimalna dužina specijalne niske
// 
// Na raspolaganju su dve kombinacije leksera i parsera:
// 	
// 	- lekser i parser ošteg tipa
// 	- lekser koji koristi regularne izraze i odgovarajući parser
// 
// Za svaki jezik može se birati vrsa leksera i parsera, ali - to podrazumeva
// da se mora voditi računa o prethodno navedenim listama specijalnih tokena,
// kao i o tome da se optši lekser mora koristiti sa opštim parserom, odnosno,
// regex lekser sa regex parserom (ne mogu se kombinovati).
// 
// Lekser i parser koji koriste regularne izraze su zaostavština iz prethodne
// verzije skripte, ali, za neke jezike / sintakse (assembler, regex),
// predstavljaju malo praktičnije rešenje, a za neke druge (markdown),
// podosta praktičnije rešenje.

/* -------------------------------------------------------------------------- */
// Jezik - TXT
/* -------------------------------------------------------------------------- */

let TXT_definicijaJezika = {
	
	naziv:        "TXT",
	defaultKlasa: "tekst",      
	//pomTekst:     tekstTXT

};

/* -------------------------------------------------------------------------- */
// Jezik - ShellSym
/* -------------------------------------------------------------------------- */

let ShellSym_definicijaJezika = {
	
	naziv:        "ShellSym",
	defaultKlasa: "tekst",      
	//pomTekst:     tekstTXT

};

/* -------------------------------------------------------------------------- */
// Jezik - CSS:
/* -------------------------------------------------------------------------- */

let CSS_lekserTokeni = new Map( [
	
	[ "/*" , "komentar" ] ,
	[ "*/" , "komentar" ] ,
	[ "//" , "komentar" ] ,
	[ "/"  , "komentar" ] ,
	[ "*"  , "komentar" ] ,
	[ "@"  , ""         ] ,
	[ "#"  , ""         ] ,
	[ ","  , ""         ] ,
	[ "."  , ""         ] ,
	[ "{"  , ""         ] ,
	[ "}"  , ""         ] ,
	[ "("  , ""         ] ,
	[ ")"  , ""         ] ,
	[ "["  , ""         ] ,
	[ "]"  , ""         ] ,
	[ "="  , ""         ] ,
	[ ">"  , ""         ] ,
	[ ":"  , ""         ] ,
	[ ";"  , ""         ] ,
	[ "'"  , ""         ] ,
	[ "\"" , ""         ] ,

] );

let CSS_parserPrepravljanje = new Map( [
	
	[ 0 , [ false , false , "tekst"             ] ] ,
	[ 1 , [ true  , true  , "komentar"          ] ] ,
	[ 2 , [ true  , true  , "komentar"          ] ] ,
	[ 3 , [ true  , true  , "niska_apostrofi"   ] ] ,
	[ 4 , [ true  , true  , "niska_navodnici"   ] ] ,
	[ 5 , [ true  , true  , "et_direktiva"      ] ] ,
	[ 6 , [ true  , true  , "id_naziv"          ] ] ,
	[ 7 , [ true  , true  , "klasa_naziv"       ] ] ,
	[ 8 , [ false , true  , "svojstvo_naziv"    ] ] ,
	[ 9 , [ false , true  , "svojstvo_vrednost" ] ] ,

] );

let CSS_parserTokeni = new Map();
	
	let CSS_parserLista_0 = new Map( [
		
		[ "/*" , [ true  , false ,  1 , "komentar"        ] ] ,
		[ "//" , [ true  , false ,  2 , "komentar"        ] ] ,
		[ "'"  , [ true  , false ,  3 , "niska_apostrofi" ] ] ,
		[ "\"" , [ true  , false ,  4 , "niska_navodnici" ] ] ,
		[ "@"  , [ true  , false ,  5 , "et_direktiva"    ] ] ,
		[ "#"  , [ true  , false ,  6 , "id_naziv"        ] ] ,
		[ "."  , [ true  , false ,  7 , "klasa_naziv"     ] ] ,
		[ "{"  , [ true  , false ,  8 , "blok_svojstva"   ] ] ,
		[ "*"  , [ false , false , -1 , "globalni"        ] ] ,
	
	] );

	let CSS_parserLista_1 = new Map( [
		
		[ "*/" , [ false , true  , -1 , "komentar"      ] ] ,
		[ "{"  , [ true  , false ,  8 , "blok_svojstva" ] ] ,
	
	] );

	let CSS_parserLista_2 = new Map( [
		
		[ "\n" , [ false , true , -1 , "white_space" ] ] ,
	
	] );

	let CSS_parserLista_3 = new Map( [
		
		[ "'"  , [ false , true , -1 , "niska_apostrofi" ] ] ,
	
	] );


	let CSS_parserLista_4 = new Map( [
		
		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,
	
	] );

	let CSS_parserLista_5 = new Map( [
		
		[ ";"  , [ false , true  , -1 , "operator"      ] ] ,
		[ "{"  , [ true  , true  ,  8 , "blok_svojstva" ] ] ,
		[ "/*" , [ true  , false ,  1 , "komentar"      ] ] ,
		[ "//" , [ true  , false ,  2 , "komentar"      ] ] ,
	
	] );

	let CSS_parserLista_6 = new Map( [
		
		[ " "  , [ false , true  , -1 , "white_space"   ] ] ,
		[ "\t" , [ false , true  , -1 , "white_space"   ] ] ,
		[ ","  , [ false , true  , -1 , "separator"     ] ] ,
		[ "{"  , [ true  , true  ,  8 , "blok_svojstva" ] ] ,
		[ "/*" , [ true  , false ,  1 , "komentar"      ] ] ,
		[ "//" , [ true  , false ,  2 , "komentar"      ] ] ,
	
	] );

	let CSS_parserLista_7 = new Map( [
		
		[ " "  , [ false , true  , -1 , "white_space"   ] ] ,
		[ "\t" , [ false , true  , -1 , "white_space"   ] ] ,
		[ ","  , [ false , true  , -1 , "separator"     ] ] ,
		[ "{"  , [ true  , true  ,  8 , "blok_svojstva" ] ] ,
		[ "/*" , [ true  , false ,  1 , "komentar"      ] ] ,
		[ "//" , [ true  , false ,  2 , "komentar"      ] ] ,
	
	] );

	let CSS_parserLista_8 = new Map( [
		
		[ "}"  , [ false , true  , -1 , "blok_svojstva"  ] ] ,
		[ ":"  , [ true  , false ,  9 , "atribut_dodela" ] ] ,
		[ "/*" , [ true  , false ,  1 , "komentar"       ] ] ,
		[ "//" , [ true  , false ,  2 , "komentar"       ] ] ,
		[ "#"  , [ true  , false ,  6 , "id_naziv"       ] ] ,
		[ "."  , [ true  , false ,  7 , "klasa_naziv"    ] ] ,
	
	] );

	let CSS_parserLista_9 = new Map( [
		
		[ ";"  , [ false , true  , -1 , "operator" ] ] ,
		[ "/*" , [ true  , false ,  1 , "komentar" ] ] ,
		[ "//" , [ true  , false ,  2 , "komentar" ] ] ,
	
	] );

CSS_parserTokeni.set( 0 , CSS_parserLista_0 )
                .set( 1 , CSS_parserLista_1 )
                .set( 2 , CSS_parserLista_2 )
                .set( 3 , CSS_parserLista_3 )
                .set( 4 , CSS_parserLista_4 )
                .set( 5 , CSS_parserLista_5 )
                .set( 6 , CSS_parserLista_6 )
                .set( 7 , CSS_parserLista_7 )
                .set( 8 , CSS_parserLista_8 )
                .set( 9 , CSS_parserLista_9 )

let CSS_parserSpecListe = new Map();

	let CSS_parserSpecLista_0 = new Map( [
		
		/* ----- html_tagovi ----- */
		
		[ "a"           , "html_tag" ] ,
		[ "abbr"        , "html_tag" ] ,
		[ "acronym"     , "html_tag" ] ,
		[ "address"     , "html_tag" ] ,
		[ "applet"      , "html_tag" ] ,
		[ "area"        , "html_tag" ] ,
		[ "article"     , "html_tag" ] ,
		[ "aside"       , "html_tag" ] ,
		[ "audio"       , "html_tag" ] ,
		[ "b"           , "html_tag" ] ,
		[ "base"        , "html_tag" ] ,
		[ "basefont"    , "html_tag" ] ,
		[ "bb"          , "html_tag" ] ,
		[ "bdo"         , "html_tag" ] ,
		[ "big"         , "html_tag" ] ,
		[ "blockquote"  , "html_tag" ] ,
		[ "body"        , "html_tag" ] ,
		[ "br"          , "html_tag" ] ,
		[ "button"      , "html_tag" ] ,
		[ "canvas"      , "html_tag" ] ,
		[ "caption"     , "html_tag" ] ,
		[ "cite"        , "html_tag" ] ,
		[ "code"        , "html_tag" ] ,
		[ "col"         , "html_tag" ] ,
		[ "colgroup"    , "html_tag" ] ,
		[ "command"     , "html_tag" ] ,
		[ "datagrid"    , "html_tag" ] ,
		[ "datalist"    , "html_tag" ] ,
		[ "dd"          , "html_tag" ] ,
		[ "del"         , "html_tag" ] ,
		[ "details"     , "html_tag" ] ,
		[ "dfn"         , "html_tag" ] ,
		[ "dialog"      , "html_tag" ] ,
		[ "dir"         , "html_tag" ] ,
		[ "div"         , "html_tag" ] ,
		[ "dl"          , "html_tag" ] ,
		[ "dt"          , "html_tag" ] ,
		[ "em"          , "html_tag" ] ,
		[ "embed"       , "html_tag" ] ,
		[ "eventsource" , "html_tag" ] ,
		[ "fieldset"    , "html_tag" ] ,
		[ "figcaption"  , "html_tag" ] ,
		[ "figure"      , "html_tag" ] ,
		[ "font"        , "html_tag" ] ,
		[ "footer"      , "html_tag" ] ,
		[ "form"        , "html_tag" ] ,
		[ "frame"       , "html_tag" ] ,
		[ "frameset"    , "html_tag" ] ,
		[ "h1"          , "html_tag" ] ,
		[ "h2"          , "html_tag" ] ,
		[ "h3"          , "html_tag" ] ,
		[ "h4"          , "html_tag" ] ,
		[ "h5"          , "html_tag" ] ,
		[ "h6"          , "html_tag" ] ,
		[ "head"        , "html_tag" ] ,
		[ "header"      , "html_tag" ] ,
		[ "hgroup"      , "html_tag" ] ,
		[ "hr"          , "html_tag" ] ,
		[ "html"        , "html_tag" ] ,
		[ "i"           , "html_tag" ] ,
		[ "iframe"      , "html_tag" ] ,
		[ "img"         , "html_tag" ] ,
		[ "input"       , "html_tag" ] ,
		[ "ins"         , "html_tag" ] ,
		[ "isindex"     , "html_tag" ] ,
		[ "kbd"         , "html_tag" ] ,
		[ "keygen"      , "html_tag" ] ,
		[ "label"       , "html_tag" ] ,
		[ "legend"      , "html_tag" ] ,
		[ "li"          , "html_tag" ] ,
		[ "link"        , "html_tag" ] ,
		[ "main"        , "html_tag" ] ,
		[ "map"         , "html_tag" ] ,
		[ "mark"        , "html_tag" ] ,
		[ "menu"        , "html_tag" ] ,
		[ "meta"        , "html_tag" ] ,
		[ "meter"       , "html_tag" ] ,
		[ "nav"         , "html_tag" ] ,
		[ "noframes"    , "html_tag" ] ,
		[ "noscript"    , "html_tag" ] ,
		[ "object"      , "html_tag" ] ,
		[ "ol"          , "html_tag" ] ,
		[ "optgroup"    , "html_tag" ] ,
		[ "option"      , "html_tag" ] ,
		[ "output"      , "html_tag" ] ,
		[ "p"           , "html_tag" ] ,
		[ "param"       , "html_tag" ] ,
		[ "pre"         , "html_tag" ] ,
		[ "progress"    , "html_tag" ] ,
		[ "q"           , "html_tag" ] ,
		[ "rp"          , "html_tag" ] ,
		[ "ruby"        , "html_tag" ] ,
		[ "s"           , "html_tag" ] ,
		[ "samp"        , "html_tag" ] ,
		[ "script"      , "html_tag" ] ,
		[ "section"     , "html_tag" ] ,
		[ "select"      , "html_tag" ] ,
		[ "small"       , "html_tag" ] ,
		[ "source"      , "html_tag" ] ,
		[ "span"        , "html_tag" ] ,
		[ "strike"      , "html_tag" ] ,
		[ "strong"      , "html_tag" ] ,
		[ "style"       , "html_tag" ] ,
		[ "sub"         , "html_tag" ] ,
		[ "sup"         , "html_tag" ] ,
		[ "t"           , "html_tag" ] ,
		[ "table"       , "html_tag" ] ,
		[ "tbody"       , "html_tag" ] ,
		[ "td"          , "html_tag" ] ,
		[ "textarea"    , "html_tag" ] ,
		[ "tfoot"       , "html_tag" ] ,
		[ "th"          , "html_tag" ] ,
		[ "thead"       , "html_tag" ] ,
		[ "time"        , "html_tag" ] ,
		[ "title"       , "html_tag" ] ,
		[ "tr"          , "html_tag" ] ,
		[ "track"       , "html_tag" ] ,
		[ "tt"          , "html_tag" ] ,
		[ "u"           , "html_tag" ] ,
		[ "ul"          , "html_tag" ] ,
		[ "video"       , "html_tag" ] ,
		[ "wbr"         , "html_tag" ] ,
		[ "center"      , "html_tag" ] ,
		[ "var"         , "html_tag" ] ,

		/* ----- pseudoklase ----- */

		[ "hover"  , "pseudoklasa" ] ,
		[ "active" , "pseudoklasa" ] ,

		/* ----- posebni ----- */

		[ "root" , "root" ] ,
	
	] );

	let CSS_parserSpecLista_9 = new Map( [
		
		/* ----- jedinice ----- */

		[ "px" , "jedinica" ] ,
		[ "em" , "jedinica" ] ,

	] );

CSS_parserSpecListe.set( 0 , CSS_parserSpecLista_0 )
                   .set( 9 , CSS_parserSpecLista_9 )

let CSS_definicijaJezika = {
	
	naziv:                 "CSS",
	defaultKlasa:          "tekst",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          CSS_lekserTokeni,
	maksDuzinaSpajanje:    2,
	kontekstZaGenerike:    -1,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  CSS_parserPrepravljanje,
	parserTokeni:          CSS_parserTokeni,
	parserSpecListe:       CSS_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeNull,
	//pomTekst:              tekstCSS

}

/* -------------------------------------------------------------------------- */
// Jezik - C
/* -------------------------------------------------------------------------- */

let C_lekserTokeni = new Map( [
	
	[ "/*"  , "komentar"                      ] ,
	[ "//"  , "komentar"                      ] ,
	[ "*/"  , "komentar"                      ] ,
	[ "#"   , "pretprocesorska_direktiva"     ] ,
	[ ":"   , "operator"                      ] ,
	[ "\""  , "niska_navodnici"               ] ,
	[ "\'"  , "niska_apostrofi"               ] ,
	[ "\`"  , "niska_backtick"                ] ,
	[ "\\"  , "escape_sekvenca"               ] ,
	[ "="   , "operator"                      ] ,
	[ "+"   , "operator"                      ] ,
	[ "-"   , "operator"                      ] ,
	[ "*"   , "operator"                      ] ,
	[ "/"   , "operator"                      ] ,
	[ "%"   , "operator"                      ] ,
	[ "=>"  , "operator"                      ] ,
	[ "+="  , "operator"                      ] ,
	[ "-="  , "operator"                      ] ,
	[ "*="  , "operator"                      ] ,
	[ "/="  , "operator"                      ] ,
	[ "%="  , "operator"                      ] ,
	[ ">>=" , "operator"                      ] ,
	[ "<<=" , "operator"                      ] ,
	[ "&="  , "operator"                      ] ,
	[ "^="  , "operator"                      ] ,
	[ "|="  , "operator"                      ] ,
	[ "++"  , "operator"                      ] ,
	[ "--"  , "operator"                      ] ,
	[ "=="  , "operator"                      ] ,
	[ "!="  , "operator"                      ] ,
	[ ">"   , "operator"                      ] ,
	[ "<"   , "operator"                      ] ,
	[ ">="  , "operator"                      ] ,
	[ "<="  , "operator"                      ] ,
	[ "!"   , "operator"                      ] ,
	[ "&&"  , "operator"                      ] ,
	[ "||"  , "operator"                      ] ,
	[ "&"   , "operator"                      ] ,
	[ "|"   , "operator"                      ] ,
	[ "^"   , "operator"                      ] ,
	[ "~"   , "operator"                      ] ,
	[ "<<"  , "operator"                      ] ,
	[ ">>"  , "operator"                      ] ,
	[ "?"   , "operator"                      ] ,
	[ ","   , "operator"                      ] ,
	[ "."   , "operator"                      ] ,
	[ ";"   , "operator"                      ] ,
	[ "->"  , "operator"                      ] ,
	[ "("   , "zagrada_obicna_otvorena"       ] ,
	[ ")"   , "zagrada_obicna_zatvorena"      ] ,
	[ "{"   , "blok_koda_otvarajuca_zagrada"  ] ,
	[ "}"   , "blok_koda_zatvarajuca_zagrada" ] ,
	[ "["   , "otvorena_zagrada_niz"          ] ,
	[ "]"   , "zatvorena_zagrada_niz"         ] ,

] );

let C_lekserUnarniOperatori = new Map( [
	[ "++" , "unarni_operator" ],
	[ "--" , "unarni_operator" ],
	[ "!"  , "unarni_operator" ],
] );

let C_parserPrepravljanje = new Map( [
	
	[ 0   , [ false , false , "identifikator"             ] ] ,
	[ 1   , [ true  , true  , "komentar"                  ] ] ,
	[ 2   , [ true  , true  , "komentar"                  ] ] ,
	[ 3   , [ true  , true  , "pretprocesorska_direktiva" ] ] ,
	[ 4   , [ true  , true  , "niska_navodnici"           ] ] ,
	[ 5   , [ true  , true  , "niska_apostrofi"           ] ] ,
	[ 6   , [ true  , true  , "niska_backtick"            ] ] ,
	[ 101 , [ true  , true  , "regularni_izraz"           ] ] ,
	[ 102 , [ true  , true  , "regex_klase_znakova"       ] ] ,
	[ 103 , [ true  , true  , "regex_zagrada"             ] ] ,

] );

let C_parserTokeni = new Map();
	
	let C_parserLista_0 = new Map( [

		/* ----- Promena konteksta ----- */

		[ "/*" , [ true , false , 1, "komentar"                  ] ] ,
		[ "//" , [ true , false , 2, "komentar"                  ] ] ,
		[ "#"  , [ true , false , 3, "pretprocesorska_direktiva" ] ] ,
		[ "\"" , [ true , false , 4, "niska_navodnici"           ] ] ,
		[ "'"  , [ true , false , 5, "niska_apostrofi"           ] ] ,
		[ "`"  , [ true , false , 6, "niska_backtick"            ] ] ,

	] );
	
	let C_parserLista_1 = new Map( [
		
		[ "*/" , [ false , true , -1 , "komentar" ] ] ,
	
	] );

	let C_parserLista_2 = new Map( [
		
		[ "\n" , [ false , true , -1 , "white_space" ] ] ,
	
	] );

	let C_parserLista_3 = new Map( [
		
		[ ">"  , [ false , true , -1 , "pretprocesorska_direktiva" ] ] ,
		[ "\n" , [ false , true , -1 , "pretprocesorska_direktiva" ] ] ,
	
	] );

	let C_parserLista_4 = new Map( [
		
		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,
	
	] );
	
	let C_parserLista_5 = new Map( [
		
		[ "'"  , [ false , true , -1 , "niska_apostrofi" ] ] ,
	
	] );
	
	let C_parserLista_6 = new Map( [
		
		[ "`"  , [ false , true , -1 , "niska_backtick" ] ] ,
	
	] );

	let C_parserLista_101 = new Map( [
		
		[ "["  , [ true  , false , 102 , "regex_klase_znakova" ] ] ,
		[ "("  , [ true  , false , 103 , "regex_zagrada"       ] ] ,
		[ "/"  , [ false , true  , -1  , "regularni_izraz"     ] ] ,
	
	] );

	let C_parserLista_102 = new Map( [

		//[ "["  , [ true  , false , 102 , "regex_klase_znakova" ] ] ,
		//[ "("  , [ true  , false , 103 , "regex_zagrada"       ] ] ,
		[ "]"  , [ false , true  , -1  , "regex_klase_znakova" ] ] ,
	
	] );

	let C_parserLista_103 = new Map( [
		
		[ "["  , [ true  , false , 102 , "regex_klase_znakova" ] ] ,
		[ "("  , [ true  , false , 103 , "regex_zagrada"       ] ] ,
		[ ")"  , [ false , true  , -1  , "regex_zagrada"       ] ] ,
	
	] );

C_parserTokeni.set( 0   , C_parserLista_0 )
              .set( 1   , C_parserLista_1 )
              .set( 2   , C_parserLista_2 )
              .set( 3   , C_parserLista_3 )
              .set( 4   , C_parserLista_4 )
              .set( 5   , C_parserLista_5 )
              .set( 6   , C_parserLista_6 )
              .set( 101 , C_parserLista_101 )
              .set( 102 , C_parserLista_102 )
              .set( 103 , C_parserLista_103 )

let C_parserSpecListe = new Map();

	let C_parserSpecLista_0 = new Map( [

		/* ----- rezervisane reči ----- */

		[ "Decimal"    , "rezervisana_rec" ] ,
		[ "Double"     , "rezervisana_rec" ] ,
		[ "Float"      , "rezervisana_rec" ] ,
		[ "Int32"      , "rezervisana_rec" ] ,
		[ "Int64"      , "rezervisana_rec" ] ,
		[ "NULL"       , "rezervisana_rec" ] ,
		[ "UInt32"     , "rezervisana_rec" ] ,
		[ "UInt64"     , "rezervisana_rec" ] ,
		[ "base"       , "rezervisana_rec" ] ,
		[ "bool"       , "rezervisana_rec" ] ,
		[ "boolean"    , "rezervisana_rec" ] ,
		[ "break"      , "rezervisana_rec" ] ,
		[ "byte"       , "rezervisana_rec" ] ,
		[ "case"       , "rezervisana_rec" ] ,
		[ "catch"      , "rezervisana_rec" ] ,
		[ "char"       , "rezervisana_rec" ] ,
		[ "class"      , "rezervisana_rec" ] ,
		[ "const"      , "rezervisana_rec" ] ,
		[ "continue"   , "rezervisana_rec" ] ,
		[ "decimal"    , "rezervisana_rec" ] ,
		[ "default"    , "rezervisana_rec" ] ,
		[ "delegate"   , "rezervisana_rec" ] ,
		[ "do"         , "rezervisana_rec" ] ,
		[ "double"     , "rezervisana_rec" ] ,
		[ "else"       , "rezervisana_rec" ] ,
		[ "enum"       , "rezervisana_rec" ] ,
		[ "event"      , "rezervisana_rec" ] ,
		[ "extends"    , "rezervisana_rec" ] ,
		[ "false"      , "rezervisana_rec" ] ,
		[ "final"      , "rezervisana_rec" ] ,
		[ "finally"    , "rezervisana_rec" ] ,
		[ "float"      , "rezervisana_rec" ] ,
		[ "for"        , "rezervisana_rec" ] ,
		[ "foreach"    , "rezervisana_rec" ] ,
		[ "get"        , "rezervisana_rec" ] ,
		[ "if"         , "rezervisana_rec" ] ,
		[ "implements" , "rezervisana_rec" ] ,
		[ "import"     , "rezervisana_rec" ] ,
		[ "int"        , "rezervisana_rec" ] ,
		[ "long"       , "rezervisana_rec" ] ,
		[ "namespace"  , "rezervisana_rec" ] ,
		[ "new"        , "rezervisana_rec" ] ,
		[ "null"       , "rezervisana_rec" ] ,
		[ "object"     , "rezervisana_rec" ] ,
		[ "override"   , "rezervisana_rec" ] ,
		[ "package"    , "rezervisana_rec" ] ,
		[ "private"    , "rezervisana_rec" ] ,
		[ "protected"  , "rezervisana_rec" ] ,
		[ "public"     , "rezervisana_rec" ] ,
		[ "return"     , "rezervisana_rec" ] ,
		[ "set"        , "rezervisana_rec" ] ,
		[ "short"      , "rezervisana_rec" ] ,
		[ "signed"     , "rezervisana_rec" ] ,
		[ "sizeof"     , "rezervisana_rec" ] ,
		[ "static"     , "rezervisana_rec" ] ,
		[ "struct"     , "rezervisana_rec" ] ,
		[ "super"      , "rezervisana_rec" ] ,
		[ "switch"     , "rezervisana_rec" ] ,
		[ "this"       , "rezervisana_rec" ] ,
		[ "throw"      , "rezervisana_rec" ] ,
		[ "true"       , "rezervisana_rec" ] ,
		[ "try"        , "rezervisana_rec" ] ,
		[ "typedef"    , "rezervisana_rec" ] ,
		[ "union"      , "rezervisana_rec" ] ,
		[ "unsigned"   , "rezervisana_rec" ] ,
		[ "unsigned"   , "rezervisana_rec" ] ,
		[ "using"      , "rezervisana_rec" ] ,
		[ "void"       , "rezervisana_rec" ] ,
		[ "while"      , "rezervisana_rec" ] ,

		/* ----- specijalni tokeni ----- */

		[ "Add"       , "specijalni_token" ] ,
		[ "Ceiling"   , "specijalni_token" ] ,
		[ "Console"   , "specijalni_token" ] ,
		[ "DateTime"  , "specijalni_token" ] ,
		[ "Day"       , "specijalni_token" ] ,
		[ "Dequeue"   , "specijalni_token" ] ,
		[ "Enqueue"   , "specijalni_token" ] ,
		[ "FILE"      , "specijalni_token" ] ,
		[ "Floor"     , "specijalni_token" ] ,
		[ "Length"    , "specijalni_token" ] ,
		[ "List"      , "specijalni_token" ] ,
		[ "Math"      , "specijalni_token" ] ,
		[ "Month"     , "specijalni_token" ] ,
		[ "Now"       , "specijalni_token" ] ,
		[ "Peek"      , "specijalni_token" ] ,
		[ "Pop"       , "specijalni_token" ] ,
		[ "Push"      , "specijalni_token" ] ,
		[ "Queue"     , "specijalni_token" ] ,
		[ "ReadKey"   , "specijalni_token" ] ,
		[ "ReadLine"  , "specijalni_token" ] ,
		[ "Second"    , "specijalni_token" ] ,
		[ "Show"      , "specijalni_token" ] ,
		[ "Stack"     , "specijalni_token" ] ,
		[ "String"    , "specijalni_token" ] ,
		[ "System"    , "specijalni_token" ] ,
		[ "Text"      , "specijalni_token" ] ,
		[ "ToArray"   , "specijalni_token" ] ,
		[ "ToString"  , "specijalni_token" ] ,
		[ "WriteLine" , "specijalni_token" ] ,
		[ "Year"      , "specijalni_token" ] ,
		[ "calloc"    , "specijalni_token" ] ,
		[ "cout"      , "specijalni_token" ] ,
		[ "delete"    , "specijalni_token" ] ,
		[ "endl"      , "specijalni_token" ] ,
		[ "fclose"    , "specijalni_token" ] ,
		[ "fopen"     , "specijalni_token" ] ,
		[ "fprintf"   , "specijalni_token" ] ,
		[ "fscanf"    , "specijalni_token" ] ,
		[ "main"      , "specijalni_token" ] ,
		[ "malloc"    , "specijalni_token" ] ,
		[ "memcpy"    , "specijalni_token" ] ,
		[ "memset"    , "specijalni_token" ] ,
		[ "out"       , "specijalni_token" ] ,
		[ "printf"    , "specijalni_token" ] ,
		[ "realloc"   , "specijalni_token" ] ,
		[ "scanf"     , "specijalni_token" ] ,
		[ "string"    , "specijalni_token" ] ,
		[ "value"     , "specijalni_token" ] ,
		[ "vector"    , "specijalni_token" ] ,

		[ "std"       , "namespace"        ] , // C++
	
	] );

C_parserSpecListe.set( 0 , C_parserSpecLista_0 );

let C_definicijaJezika = {
	
	naziv:                 "C",
	defaultKlasa:          "identifikator",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          C_lekserTokeni,
	lekserUnarniOperatori: C_lekserUnarniOperatori,
	maksDuzinaSpajanje:    3,
	kontekstZaGenerike:    0,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  C_parserPrepravljanje,
	parserTokeni:          C_parserTokeni,
	parserSpecListe:       C_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeNull,
	//pomTekst:              tekstC

};

let CLIKE_definicijaJezika = {
	
	naziv:                 "CLIKE",
	defaultKlasa:          "identifikator",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          C_lekserTokeni,
	lekserUnarniOperatori: C_lekserUnarniOperatori,
	maksDuzinaSpajanje:    3,
	kontekstZaGenerike:    0,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  C_parserPrepravljanje,
	parserTokeni:          C_parserTokeni,
	parserSpecListe:       C_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeNull,
	//pomTekst:              tekstC

};

/* -------------------------------------------------------------------------- */
// Jezik - C++
/* -------------------------------------------------------------------------- */

let CPP_definicijaJezika = {
	
	naziv:                 "C++",
	defaultKlasa:          "identifikator",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          C_lekserTokeni,
	lekserUnarniOperatori: C_lekserUnarniOperatori,
	maksDuzinaSpajanje:    3,
	kontekstZaGenerike:    0,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  C_parserPrepravljanje,
	parserTokeni:          C_parserTokeni,
	parserSpecListe:       C_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeNull,
	//pomTekst:              tekstCPP

};

/* -------------------------------------------------------------------------- */
// Jezik - C#
/* -------------------------------------------------------------------------- */

let C_Sharp_definicijaJezika = {
	
	naziv:                 "C#",
	defaultKlasa:          "identifikator",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          C_lekserTokeni,
	lekserUnarniOperatori: C_lekserUnarniOperatori,
	maksDuzinaSpajanje:    3,
	kontekstZaGenerike:    0,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  C_parserPrepravljanje,
	parserTokeni:          C_parserTokeni,
	parserSpecListe:       C_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeNull,
	//pomTekst:              tekstCSharp

};

/* -------------------------------------------------------------------------- */
// Jezik - Java
/* -------------------------------------------------------------------------- */

let Java_parserSpecListe = new Map();

	let Java_parserSpecLista_0 = new Map( [

		/* ----- rezervisane reči ----- */

		[ "abstract"     , "rezervisana_rec" ] ,
		[ "assert"       , "rezervisana_rec" ] ,
		[ "boolean"      , "rezervisana_rec" ] ,
		[ "break"        , "rezervisana_rec" ] ,
		[ "byte"         , "rezervisana_rec" ] ,
		[ "case"         , "rezervisana_rec" ] ,
		[ "catch"        , "rezervisana_rec" ] ,
		[ "char"         , "rezervisana_rec" ] ,
		[ "class"        , "rezervisana_rec" ] ,
		[ "continue"     , "rezervisana_rec" ] ,
		[ "const"        , "rezervisana_rec" ] ,
		[ "default"      , "rezervisana_rec" ] ,
		[ "do"           , "rezervisana_rec" ] ,
		[ "double"       , "rezervisana_rec" ] ,
		[ "else"         , "rezervisana_rec" ] ,
		[ "enum"         , "rezervisana_rec" ] ,
		[ "exports"      , "rezervisana_rec" ] ,
		[ "extends"      , "rezervisana_rec" ] ,
		[ "final"        , "rezervisana_rec" ] ,
		[ "finally"      , "rezervisana_rec" ] ,
		[ "float"        , "rezervisana_rec" ] ,
		[ "for"          , "rezervisana_rec" ] ,
		[ "goto"         , "rezervisana_rec" ] ,
		[ "if"           , "rezervisana_rec" ] ,
		[ "implements"   , "rezervisana_rec" ] ,
		[ "import"       , "rezervisana_rec" ] ,
		[ "instanceof"   , "rezervisana_rec" ] ,
		[ "int"          , "rezervisana_rec" ] ,
		[ "interface"    , "rezervisana_rec" ] ,
		[ "long"         , "rezervisana_rec" ] ,
		[ "module"       , "rezervisana_rec" ] ,
		[ "native"       , "rezervisana_rec" ] ,
		[ "new"          , "rezervisana_rec" ] ,
		[ "package"      , "rezervisana_rec" ] ,
		[ "private"      , "rezervisana_rec" ] ,
		[ "protected"    , "rezervisana_rec" ] ,
		[ "public"       , "rezervisana_rec" ] ,
		[ "requires"     , "rezervisana_rec" ] ,
		[ "return"       , "rezervisana_rec" ] ,
		[ "short"        , "rezervisana_rec" ] ,
		[ "static"       , "rezervisana_rec" ] ,
		[ "strictfp"     , "rezervisana_rec" ] ,
		[ "super"        , "rezervisana_rec" ] ,
		[ "switch"       , "rezervisana_rec" ] ,
		[ "synchronized" , "rezervisana_rec" ] ,
		[ "this"         , "rezervisana_rec" ] ,
		[ "throw"        , "rezervisana_rec" ] ,
		[ "throws"       , "rezervisana_rec" ] ,
		[ "transient"    , "rezervisana_rec" ] ,
		[ "try"          , "rezervisana_rec" ] ,
		[ "var"          , "rezervisana_rec" ] ,
		[ "void"         , "rezervisana_rec" ] ,
		[ "volatile"     , "rezervisana_rec" ] ,
		[ "while"        , "rezervisana_rec" ] ,

		/* ----- specijalni token ----- */

		[ "Add"           , "specijalni_token" ] ,
		[ "ArrayList"     , "specijalni_token" ] ,
		[ "LinkedList"    , "specijalni_token" ] ,
		[ "List"          , "specijalni_token" ] ,
		[ "LocalDate"     , "specijalni_token" ] ,
		[ "LocalDateTime" , "specijalni_token" ] ,
		[ "Math"          , "specijalni_token" ] ,
		[ "Queue"         , "specijalni_token" ] ,
		[ "Stack"         , "specijalni_token" ] ,
		[ "String"        , "specijalni_token" ] ,
		[ "System"        , "specijalni_token" ] ,
		[ "ceil"          , "specijalni_token" ] ,
		[ "floor"         , "specijalni_token" ] ,
		[ "format"        , "specijalni_token" ] ,
		[ "getDayOfMonth" , "specijalni_token" ] ,
		[ "getMonthValue" , "specijalni_token" ] ,
		[ "getSecond"     , "specijalni_token" ] ,
		[ "java"          , "specijalni_token" ] ,
		[ "length"        , "specijalni_token" ] ,
		[ "now"           , "specijalni_token" ] ,
		[ "null"          , "specijalni_token" ] ,
		[ "out"           , "specijalni_token" ] ,
		[ "printf"        , "specijalni_token" ] ,
		[ "pop"           , "specijalni_token" ] ,
		[ "push"          , "specijalni_token" ] ,
		[ "string"        , "specijalni_token" ] ,
		[ "util"          , "specijalni_token" ] ,
	
	] );	

Java_parserSpecListe.set( 0 , Java_parserSpecLista_0 );

let Java_definicijaJezika = {
	
	naziv:                 "Java",
	defaultKlasa:          "identifikator",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          C_lekserTokeni,
	lekserUnarniOperatori: C_lekserUnarniOperatori,
	maksDuzinaSpajanje:    3,
	kontekstZaGenerike:    0,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  C_parserPrepravljanje,
	parserTokeni:          C_parserTokeni,
	parserSpecListe:       Java_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeNull,
	//pomTekst:              tekstJava

};

/* -------------------------------------------------------------------------- */
// Jezik - JavaScript
/* -------------------------------------------------------------------------- */

let JavaScript_parserSpecListe = new Map();

	let JavaScript_parserSpecLista_0 = new Map( [

		/* ----- rezervisane reči ----- */

		[ "arguments"    , "rezervisana_rec" ] ,
		[ "await"        , "rezervisana_rec" ] ,
		[ "boolean"      , "rezervisana_rec" ] ,
		[ "break"        , "rezervisana_rec" ] ,
		[ "byte"         , "rezervisana_rec" ] ,
		[ "case"         , "rezervisana_rec" ] ,
		[ "catch"        , "rezervisana_rec" ] ,
		[ "char"         , "rezervisana_rec" ] ,
		[ "class"        , "rezervisana_rec" ] ,
		[ "const"        , "rezervisana_rec" ] ,
		[ "continue"     , "rezervisana_rec" ] ,
		[ "debugger"     , "rezervisana_rec" ] ,
		[ "default"      , "rezervisana_rec" ] ,
		[ "delete"       , "rezervisana_rec" ] ,
		[ "do"           , "rezervisana_rec" ] ,
		[ "double"       , "rezervisana_rec" ] ,
		[ "else"         , "rezervisana_rec" ] ,
		[ "enum"         , "rezervisana_rec" ] ,
		[ "eval"         , "rezervisana_rec" ] ,
		[ "export"       , "rezervisana_rec" ] ,
		[ "extends"      , "rezervisana_rec" ] ,
		[ "false"        , "rezervisana_rec" ] ,
		[ "final"        , "rezervisana_rec" ] ,
		[ "finally"      , "rezervisana_rec" ] ,
		[ "float"        , "rezervisana_rec" ] ,
		[ "for"          , "rezervisana_rec" ] ,
		[ "function"     , "rezervisana_rec" ] ,
		[ "goto"         , "rezervisana_rec" ] ,
		[ "if"           , "rezervisana_rec" ] ,
		[ "implements"   , "rezervisana_rec" ] ,
		[ "import"       , "rezervisana_rec" ] ,
		[ "in"           , "rezervisana_rec" ] ,
		[ "instanceof"   , "rezervisana_rec" ] ,
		[ "int"          , "rezervisana_rec" ] ,
		[ "interface"    , "rezervisana_rec" ] ,
		[ "let"          , "rezervisana_rec" ] ,
		[ "long"         , "rezervisana_rec" ] ,
		[ "native"       , "rezervisana_rec" ] ,
		[ "new"          , "rezervisana_rec" ] ,
		[ "null"         , "rezervisana_rec" ] ,
		[ "package"      , "rezervisana_rec" ] ,
		[ "private"      , "rezervisana_rec" ] ,
		[ "protected"    , "rezervisana_rec" ] ,
		[ "public"       , "rezervisana_rec" ] ,
		[ "return"       , "rezervisana_rec" ] ,
		[ "short"        , "rezervisana_rec" ] ,
		[ "static"       , "rezervisana_rec" ] ,
		[ "super"        , "rezervisana_rec" ] ,
		[ "switch"       , "rezervisana_rec" ] ,
		[ "synchronized" , "rezervisana_rec" ] ,
		[ "this"         , "rezervisana_rec" ] ,
		[ "throw"        , "rezervisana_rec" ] ,
		[ "throws"       , "rezervisana_rec" ] ,
		[ "transient"    , "rezervisana_rec" ] ,
		[ "true"         , "rezervisana_rec" ] ,
		[ "try"          , "rezervisana_rec" ] ,
		[ "typeof"       , "rezervisana_rec" ] ,
		[ "var"          , "rezervisana_rec" ] ,
		[ "void"         , "rezervisana_rec" ] ,
		[ "volatile"     , "rezervisana_rec" ] ,
		[ "while"        , "rezervisana_rec" ] ,
		[ "with"         , "rezervisana_rec" ] ,
		[ "yield"        , "rezervisana_rec" ] ,

		/* ----- specijalni tokeni ----- */

		[ "Date"                   , "specijalni_token" ] ,
		[ "Error"                  , "specijalni_token" ] ,
		[ "Promise"                , "specijalni_token" ] ,
		[ "all"                    , "specijalni_token" ] ,
		[ "async"                  , "specijalni_token" ] ,
		[ "classList"              , "specijalni_token" ] ,
		[ "className"              , "specijalni_token" ] ,
		[ "console"                , "specijalni_token" ] ,
		[ "contains"               , "specijalni_token" ] ,
		[ "constructor"            , "specijalni_token" ] ,
		[ "currentScript"          , "specijalni_token" ] ,
		[ "document"               , "specijalni_token" ] ,
		[ "error"                  , "specijalni_token" ] ,
		[ "exec"                   , "specijalni_token" ] ,
		[ "fetch"                  , "specijalni_token" ] ,
		[ "forEach"                , "specijalni_token" ] ,
		[ "fs"                     , "specijalni_token" ] ,
		[ "getElementById"         , "specijalni_token" ] ,
		[ "getElementsByClassName" , "specijalni_token" ] ,
		[ "getElementsByTagName"   , "specijalni_token" ] ,
		[ "getItem"                , "specijalni_token" ] ,
		[ "indexOf"                , "specijalni_token" ] ,
		[ "innerHTML"              , "specijalni_token" ] ,
		[ "innerText"              , "specijalni_token" ] ,
		[ "isArray"                , "specijalni_token" ] ,
		[ "length"                 , "specijalni_token" ] ,
		[ "localStorage"           , "specijalni_token" ] ,
		[ "log"                    , "specijalni_token" ] ,
		[ "map"                    , "specijalni_token" ] ,
		[ "match"                  , "specijalni_token" ] ,
		[ "parentElement"          , "specijalni_token" ] ,
		[ "path"                   , "specijalni_token" ] ,
		[ "pop"                    , "specijalni_token" ] ,
		[ "push"                   , "specijalni_token" ] ,
		[ "querySelectorAll"       , "specijalni_token" ] ,
		[ "reject"                 , "specijalni_token" ] ,
		[ "replace"                , "specijalni_token" ] ,
		[ "resolve"                , "specijalni_token" ] ,
		[ "sessionStorage"         , "specijalni_token" ] ,
		[ "setInterval"            , "specijalni_token" ] ,
		[ "setItem"                , "specijalni_token" ] ,
		[ "setTimeout"             , "specijalni_token" ] ,
		[ "shift"                  , "specijalni_token" ] ,
		[ "slice"                  , "specijalni_token" ] ,
		[ "src"                    , "specijalni_token" ] ,
		[ "then"                   , "specijalni_token" ] ,
		[ "toLowerCase"            , "specijalni_token" ] ,
		[ "toString"               , "specijalni_token" ] ,
		[ "toUpperCase"            , "specijalni_token" ] ,
		[ "writeFile"              , "specijalni_token" ] ,

	] );

JavaScript_parserSpecListe.set( 0 , JavaScript_parserSpecLista_0 );

let JavaScript_definicijaJezika = {
	
	naziv:                 "JavaScript",
	defaultKlasa:          "identifikator",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          C_lekserTokeni,
	lekserUnarniOperatori: C_lekserUnarniOperatori,
	maksDuzinaSpajanje:    3,
	kontekstZaGenerike:    0,
	kontekstZaRegex:       0,
	parserPrepravaljanje:  C_parserPrepravljanje,
	parserTokeni:          C_parserTokeni,
	parserSpecListe:       JavaScript_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeNull,
	//pomTekst:              tekstJS

};

/* -------------------------------------------------------------------------- */
// Jezik - HTML
/* -------------------------------------------------------------------------- */

let HTML_lekserTokeni = new Map( [
	
	[ "<"    , "html_tag"       ] ,
	[ ">"    , "html_tag"       ] ,
	[ "/"    , "html_tag"       ] ,
	[ "!"    , "html_tag"       ] ,
	[ "-"    , "komentar"       ] ,
	[ "="    , "atribut_dodela" ] ,
	[ "\""   , ""               ] ,
	[ "\'"   , ""               ] ,
	[ "\`"   , ""               ] ,
	[ "</"   , "html_tag"       ] ,
	[ "/>"   , "html_tag"       ] ,
	[ "<!"   , "doctype"        ] ,
	[ "<!--" , "komentar"       ] ,
	[ "-->"  , "komentar"       ] ,
	
	/* ----- CSS blok ----- */

	[ "#"  , ""                 ] ,
	[ "@"  , ""                 ] ,
	[ ":"  , ""                 ] ,
	[ ";"  , "operator"         ] ,
	[ ","  , ""                 ] ,
	[ "."  , ""                 ] ,
	[ "*"  , ""                 ] ,
	[ "/*" , "komentar"         ] ,
	[ "*/" , "komentar"         ] ,
	[ "//" , "komentar"         ] ,

	/* ----- JS blok ----- */

	//[ "=" , "operator"         ] ,
	[ "+"  , "operator"         ] ,
	[ "-"  , "operator"         ] ,
	[ "*"  , "operator"         ] ,
	[ "/"  , "operator"         ] ,
	[ "=>" , "operator"         ] ,
	[ "+=" , "operator"         ] ,
	[ "(" , "operator"          ] ,
	[ ")" , "operator"          ] ,
] );

let HTML_parserPrepravljanje = new Map( [
	
	[ 0  , [ true  , true  , "tekst"             ] ] ,
	[ 1  , [ true  , true  , "html_tag"          ] ] ,
	[ 2  , [ false , true  , "atribut_naziv"     ] ] ,
	[ 3  , [ true  , true  , "niska_apostrofi"   ] ] ,
	[ 4  , [ true  , true  , "niska_navodnici"   ] ] ,
	[ 5  , [ true  , true  , "komentar"          ] ] ,
	[ 7  , [ false , true  , "atribut_naziv"     ] ] , // <style>
	[ 71 , [ true  , true  , "html_tag"          ] ] , // <style>
	[ 8  , [ false , true  , "atribut_naziv"     ] ] , // <script>
	[ 81 , [ true  , true  , "html_tag"          ] ] , // <script>

	/* ----- CSS blok ( <style></stype> ) ----- */
	
	[ 10 , [ false , false , "tekst"             ] ] ,
	[ 11 , [ true  , true  , "komentar"          ] ] ,
	[ 12 , [ true  , true  , "komentar"          ] ] ,
	[ 13 , [ true  , true  , "niska_apostrofi"   ] ] ,
	[ 14 , [ true  , true  , "niska_navodnici"   ] ] ,
	[ 15 , [ true  , true  , "et_direktiva"      ] ] ,
	[ 16 , [ true  , true  , "id_naziv"          ] ] ,
	[ 17 , [ true  , true  , "klasa_naziv"       ] ] ,
	[ 18 , [ false , true  , "svojstvo_naziv"    ] ] ,
	[ 19 , [ false , true  , "svojstvo_vrednost" ] ] ,
	
	/* ----- JS blok (<scrypt></scrypt>) ----- */

	[ 20 , [ false , false , "identifikator"             ] ] ,
	[ 21 , [ true  , true  , "komentar"                  ] ] ,
	[ 22 , [ true  , true  , "komentar"                  ] ] ,
	[ 23 , [ true  , true  , "pretprocesorska_direktiva" ] ] ,
	[ 24 , [ true  , true  , "niska_apostrofi"           ] ] ,
	[ 25 , [ true  , true  , "niska_navodnici"           ] ] ,
	[ 26 , [ true  , true  , "niska_backtick"            ] ] ,

] );

let HTML_parserTokeni = new Map();
	
	let HTML_parserLista_0 = new Map( [
		
		[ "<"    , [ true  , false ,  1 , "html_tag" ] ] ,
		[ "</"   , [ true  , false ,  1 , "html_tag" ] ] ,
		[ "<!--" , [ true  , false ,  5 , "komentar" ] ] ,
	
	] );

	let HTML_parserLista_1 = new Map( [
		
		[ " "      , [ true  , true ,  2 , "white_space" ] ] ,
		[ "\t"     , [ true  , true ,  2 , "white_space" ] ] ,
		[ ">"      , [ false , true , -1 , "html_tag"    ] ] ,
		[ "/>"     , [ false , true , -1 , "html_tag"    ] ] ,
		[ "style"  , [ true  , true ,  7 , "html_tag"    ] ] ,
		[ "script" , [ true  , true ,  8 , "html_tag"    ] ] ,
	
	] );
	
	let HTML_parserLista_2 = new Map( [
		
		[ " "  , [ false , false , -1 , "white_space"     ] ] ,
		[ ">"  , [ false , true  , -1 , "html_tag"        ] ] ,
		[ "/>" , [ false , true  , -1 , "html_tag"        ] ] ,
		[ "="  , [ false , false , -1 , "atribut_dodela"  ] ] ,
		[ "\'" , [ true  , false ,  3 , "niska_apostrofi" ] ] ,
		[ "\"" , [ true  , false ,  4 , "niska_navodnici" ] ] ,
	
	] );

	let HTML_parserLista_3 = new Map( [
		
		[ "\'" , [ false , true , -1 , "niska_apostrofi" ] ] ,
	
	] );

	let HTML_parserLista_4 = new Map( [
		
		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,
	
	] );
	
	let HTML_parserLista_5 = new Map( [
		
		[ "-->" , [ false , true , -1 , "komentar" ] ] ,
		// [ ">"   , [ false , true , -1 , "komentar" ] ] ,
	
	] );

	/* ----- Kopije dvojke i keca - uvod u CSS kontekst ----- */

	let HTML_parserLista_7 = new Map( [
		
		[ ">"  , [ true  , true  , 10 , "html_tag"        ] ] ,
		[ "="  , [ false , false , -1 , "atribut_dodela"  ] ] ,
		[ " "  , [ false , false , -1 , "white_space"     ] ] ,
		[ "\t" , [ false , false , -1 , "white_space"     ] ] ,
		[ "\'" , [ true  , false ,  3 , "niska_apostrofi" ] ] ,
		[ "\"" , [ true  , false ,  4 , "niska_navodnici" ] ] ,

	] );

	let HTML_parserLista_71 = new Map( [
		
		[ "style"  , [ true  , true ,  1 , "html_tag"    ] ] ,
		
	] );

	/* ----- CSS blok ----- */

	let HTML_parserLista_10 = new Map( [

		[ "/*"  , [ true  , false , 11 , "komentar"        ] ] ,
		[ "//"  , [ true  , false , 12 , "komentar"        ] ] ,
		[ "'"   , [ true  , false , 13 , "niska_apostrofi" ] ] ,
		[ "\""  , [ true  , false , 14 , "niska_navodnici" ] ] ,
		[ "@"   , [ true  , false , 15 , "et_direktiva"    ] ] ,
		[ "#"   , [ true  , false , 16 , "id_naziv"        ] ] ,
		[ "."   , [ true  , false , 17 , "klasa_naziv"     ] ] ,
		[ "{"   , [ true  , false , 18 , "blok_svojstva"   ] ] ,
		[ "*"   , [ false , false , -1 , "globalni"        ] ] ,
		[ "</"  , [ true  , true  , 71 , "html_tag"        ] ] ,
	
	] );

	let HTML_parserLista_11 = new Map( [

		[ "*/" , [ false , true  , -1 , "komentar"      ] ] ,
		[ "{"  , [ true  , false , 18 , "blok_svojstva" ] ] ,
	
	] );

	let HTML_parserLista_12 = new Map( [

		[ "\n" , [ false , true , -1 , "white_space" ] ] ,

	] );

	let HTML_parserLista_13 = new Map( [

		[ "'"  , [ false , true , -1 , "niska_apostrofi" ] ] ,
	
	] );

	let HTML_parserLista_14 = new Map( [

		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,

	] );

	let HTML_parserLista_15 = new Map( [

		[ ";"  , [ false , true  , -1 , "operator"      ] ] ,
		[ "{"  , [ true  , true  , 18 , "blok_svojstva" ] ] ,
		[ "/*" , [ true  , false , 11 , "komentar"      ] ] ,
		[ "//" , [ true  , false , 12 , "komentar"      ] ] ,

	] );

	let HTML_parserLista_16 = new Map( [

		[ " "  , [ false , true  , -1 , "white_space"   ] ] ,
		[ "\t" , [ false , true  , -1 , "white_space"   ] ] ,
		[ ","  , [ false , true  , -1 , "separator"     ] ] ,
		[ "{"  , [ true  , true  , 18 , "blok_svojstva" ] ] ,
		[ "/*" , [ true  , false , 11 , "komentar"      ] ] ,
		[ "//" , [ true  , false , 12 , "komentar"      ] ] ,

	] );

	let HTML_parserLista_17 = new Map( [

		[ " "  , [ false , true  , -1 , "white_space"   ] ] ,
		[ "\t" , [ false , true  , -1 , "white_space"   ] ] ,
		[ ","  , [ false , true  , -1 , "separator"     ] ] ,
		[ "{"  , [ true  , true  , 18 , "blok_svojstva" ] ] ,
		[ "/*" , [ true  , false , 11 , "komentar"      ] ] ,
		[ "//" , [ true  , false , 12 , "komentar"      ] ] ,

	] );

	let HTML_parserLista_18 = new Map( [

		[ "}"  , [ false , true  , -1 , "blok_svojstva"  ] ] ,
		[ ":"  , [ true  , false , 19 , "atribut_dodela" ] ] ,
		[ "/*" , [ true  , false , 11 , "komentar"       ] ] ,
		[ "//" , [ true  , false , 12 , "komentar"       ] ] ,
		[ "#"  , [ true  , false , 16 , "id_naziv"       ] ] ,
		[ "."  , [ true  , false , 17 , "klasa_naziv"    ] ] ,

	] );

	let HTML_parserLista_19 = new Map( [

		[ ";"  , [ false , true  , -1 , "operator" ] ] ,
		[ "/*" , [ true  , false , 11 , "komentar" ] ] ,
		[ "//" , [ true  , false , 12 , "komentar" ] ] ,

	] );

	/* ----- Kopije dvojke i keca - uvod u JS kontekst ----- */

	let HTML_parserLista_8 = new Map( [
		
		[ ">"  , [ true  , true  , 20 , "html_tag"        ] ] ,
		[ "="  , [ false , false , -1 , "atribut_dodela"  ] ] ,
		[ " "  , [ false , false , -1 , "white_space"     ] ] ,
		[ "\t" , [ false , false , -1 , "white_space"     ] ] ,
		[ "\'" , [ true  , false ,  3 , "niska_apostrofi" ] ] ,
		[ "\"" , [ true  , false ,  4 , "niska_navodnici" ] ] ,

	] );

	let HTML_parserLista_81 = new Map( [
		
		[ "script"  , [ true  , true ,  1 , "html_tag"    ] ] ,
		
	] );

	/* ----- JS blok ----- */

	let HTML_parserLista_20 = new Map( [

		[ "/*" , [ true , false , 21 , "komentar"                  ] ] ,
		[ "//" , [ true , false , 22 , "komentar"                  ] ] ,
		[ "#"  , [ true , false , 23 , "pretprocesorska_direktiva" ] ] ,
		[ "\"" , [ true , false , 24 , "niska_navodnici"           ] ] ,
		[ "'"  , [ true , false , 25 , "niska_apostrofi"           ] ] ,
		[ "`"  , [ true , false , 26 , "niska_backtick"            ] ] ,
		[ "</" , [ true , true  , 81 , "html_tag"                  ] ] ,

	] );
	
	let HTML_parserLista_21 = new Map( [
		
		[ "*/" , [ false , true , -1 , "komentar" ] ] ,
	
	] );

	let HTML_parserLista_22 = new Map( [
		
		[ "\n" , [ false , true , -1 , "white_space" ] ] ,
	
	] );

	let HTML_parserLista_23 = new Map( [
		
		[ ">"  , [ false , true , -1 , "pretprocesorska_direktiva" ] ] ,
		[ "\n" , [ false , true , -1 , "pretprocesorska_direktiva" ] ] ,
	
	] );

	let HTML_parserLista_24 = new Map( [
		
		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,
	
	] );
	
	let HTML_parserLista_25 = new Map( [
		
		[ "'"  , [ false , true , -1 , "niska_apostrofi" ] ] ,
	
	] );
	
	let HTML_parserLista_26 = new Map( [
		
		[ "`"  , [ false , true , -1 , "niska_backtick" ] ] ,
	
	] );

HTML_parserTokeni.set( 0  , HTML_parserLista_0 )
                 .set( 1  , HTML_parserLista_1 )
                 .set( 2  , HTML_parserLista_2 )
                 .set( 3  , HTML_parserLista_3 )
                 .set( 4  , HTML_parserLista_4 )
                 .set( 5  , HTML_parserLista_5 )

                 /* ----- CSS blok ----- */

                 .set( 7  , HTML_parserLista_7  )
                 .set( 71 , HTML_parserLista_71 )
                 .set( 10 , HTML_parserLista_10 )
                 .set( 11 , HTML_parserLista_11 )
                 .set( 12 , HTML_parserLista_12 )
                 .set( 13 , HTML_parserLista_13 )
                 .set( 14 , HTML_parserLista_14 )
                 .set( 15 , HTML_parserLista_15 )
                 .set( 16 , HTML_parserLista_16 )
                 .set( 17 , HTML_parserLista_17 )
                 .set( 18 , HTML_parserLista_18 )
                 .set( 19 , HTML_parserLista_19 )

                 /* ----- JS blok ----- */

                 .set( 8  , HTML_parserLista_8  )
                 .set( 81 , HTML_parserLista_81 )
                 .set( 20 , HTML_parserLista_20 )
                 .set( 21 , HTML_parserLista_21 )
                 .set( 22 , HTML_parserLista_22 )
                 .set( 23 , HTML_parserLista_23 )
                 .set( 24 , HTML_parserLista_24 )
                 .set( 25 , HTML_parserLista_25 )
                 .set( 26 , HTML_parserLista_26 )


let HTML_parserSpecListe = new Map();

HTML_parserSpecListe.set( 10 , CSS_parserSpecLista_0        );
HTML_parserSpecListe.set( 20 , JavaScript_parserSpecLista_0 );

let HTML_definicijaJezika = {
	
	naziv:                 "HTML",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          HTML_lekserTokeni,
	maksDuzinaSpajanje:    4,
	kontekstZaGenerike:    -1,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  HTML_parserPrepravljanje,
	parserTokeni:          HTML_parserTokeni,
	parserSpecListe:       HTML_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeHTML,
	//pomTekst:              tekstHTML

}

let XML_definicijaJezika = {
	
	naziv:                 "XML",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          HTML_lekserTokeni,
	maksDuzinaSpajanje:    4,
	kontekstZaGenerike:    -1,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  HTML_parserPrepravljanje,
	parserTokeni:          HTML_parserTokeni,
	parserSpecListe:       HTML_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeHTML,
	//pomTekst:              tekstHTML

}

/* -------------------------------------------------------------------------- */
// Jezik - SQL
/* -------------------------------------------------------------------------- */

let SQL_lekserTokeni = new Map( [
	
	[ "--" , "komentar"                 ] ,
	[ ";"  , ""                         ] ,
	[ "-"  , ""                         ] ,
	[ "("  , "zagrada_obicna_otvorena"  ] ,
	[ ")"  , "zagrada_obicna_zatvorena" ] ,
	[ ","  , ""                         ] ,
	[ "\"" , ""                         ] ,
	[ "\'" , ""                         ] ,
	[ "\`" , ""                         ] ,

] );

let SQL_parserPrepravljanje = new Map( [
	
	[ 0 , [ false , false , "tekst"           ] ] ,
	[ 1 , [ true  , true  , "komentar"        ] ] ,
	[ 2 , [ true  , true  , "niska_apostrofi" ] ] ,
	[ 3 , [ true  , true  , "niska_navodnici" ] ] ,
	[ 4 , [ true  , true  , "niska_backtick"  ] ] ,

] );

let SQL_parserTokeni = new Map();
	
	let SQL_parserLista_0 = new Map( [
		
		/* ----- promena konteksta ----- */

		[ "--" , [ true , false , 1 , "komentar"        ] ] ,
		[ "\"" , [ true , false , 2 , "niska_navodnici" ] ] ,
		[ "\'" , [ true , false , 3 , "niska_apostrofi" ] ] ,
		[ "\`" , [ true , false , 4 , "niska_backtick"  ] ] ,
	
	] );


	let SQL_parserLista_1 = new Map( [
		
		[ "\n" , [ false , true , -1 , "white_space" ] ] ,
	
	] );

	let SQL_parserLista_2 = new Map( [
		
		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,
	
	] );

	let SQL_parserLista_3 = new Map( [
		
		[ "\'" , [ false , true , -1 , "niska_apostrofi" ] ] ,
	
	] );

	let SQL_parserLista_4 = new Map( [
		
		[ "\`" , [ false , true , -1 , "niska_backtick" ] ] ,
	
	] );

SQL_parserTokeni.set( 0, SQL_parserLista_0 )
                .set( 1, SQL_parserLista_1 )
                .set( 2, SQL_parserLista_2 )
                .set( 3, SQL_parserLista_3 )
                .set( 4, SQL_parserLista_4 )

let SQL_parserSpecListe = new Map();
	
	let SQL_parserSpecLista_0 = new Map( [
		
		/* ----- rezervisana rec ----- */

		[ "ADD"            , "rezervisana_rec" ] ,
		[ "AFTER"          , "rezervisana_rec" ] ,
		[ "ALTER"          , "rezervisana_rec" ] ,
		[ "AS"             , "rezervisana_rec" ] ,
		[ "ASC"            , "rezervisana_rec" ] ,
		[ "AUTO_INCREMENT" , "rezervisana_rec" ] ,
		[ "BY"             , "rezervisana_rec" ] ,
		[ "CREATE"         , "rezervisana_rec" ] ,
		[ "CHARACTER"      , "rezervisana_rec" ] ,
		[ "COLLATE"        , "rezervisana_rec" ] ,
		[ "DATABASE"       , "rezervisana_rec" ] ,
		[ "DELETE"         , "rezervisana_rec" ] ,
		[ "DESC"           , "rezervisana_rec" ] ,
		[ "DISTINCT"       , "rezervisana_rec" ] ,
		[ "DROP"           , "rezervisana_rec" ] ,
		[ "EXISTS"         , "rezervisana_rec" ] ,
		[ "FOREIGN"        , "rezervisana_rec" ] ,
		[ "FROM"           , "rezervisana_rec" ] ,
		[ "GROUP"          , "rezervisana_rec" ] ,
		[ "HAVING"         , "rezervisana_rec" ] ,
		[ "IF"             , "rezervisana_rec" ] ,
		[ "INSERT"         , "rezervisana_rec" ] ,
		[ "INNER"          , "rezervisana_rec" ] ,
		[ "INTO"           , "rezervisana_rec" ] ,
		[ "JOIN"           , "rezervisana_rec" ] ,
		[ "KEY"            , "rezervisana_rec" ] ,
		[ "LEFT"           , "rezervisana_rec" ] ,
		[ "NOT"            , "rezervisana_rec" ] ,
		[ "NULL"           , "rezervisana_rec" ] ,
		[ "ON"             , "rezervisana_rec" ] ,
		[ "ORDER"          , "rezervisana_rec" ] ,
		[ "OUTER"          , "rezervisana_rec" ] ,
		[ "PRIMARY"        , "rezervisana_rec" ] ,
		[ "REFERENCES"     , "rezervisana_rec" ] ,
		[ "RIGHT"          , "rezervisana_rec" ] ,
		[ "SELECT"         , "rezervisana_rec" ] ,
		[ "SET"            , "rezervisana_rec" ] ,
		[ "TABLE"          , "rezervisana_rec" ] ,
		[ "UNIQUE"         , "rezervisana_rec" ] ,
		[ "UPDATE"         , "rezervisana_rec" ] ,
		[ "USE"            , "rezervisana_rec" ] ,
		[ "VALUES"         , "rezervisana_rec" ] ,
		[ "WHERE"          , "rezervisana_rec" ] ,
		[ "add"            , "rezervisana_rec" ] ,
		[ "after"          , "rezervisana_rec" ] ,
		[ "alter"          , "rezervisana_rec" ] ,
		[ "as"             , "rezervisana_rec" ] ,
		[ "asc"            , "rezervisana_rec" ] ,
		[ "auto_increment" , "rezervisana_rec" ] ,
		[ "by"             , "rezervisana_rec" ] ,
		[ "create"         , "rezervisana_rec" ] ,
		[ "database"       , "rezervisana_rec" ] ,
		[ "delete"         , "rezervisana_rec" ] ,
		[ "foreign"        , "rezervisana_rec" ] ,
		[ "from"           , "rezervisana_rec" ] ,
		[ "insert"         , "rezervisana_rec" ] ,
		[ "into"           , "rezervisana_rec" ] ,
		[ "key"            , "rezervisana_rec" ] ,
		[ "not"            , "rezervisana_rec" ] ,
		[ "null"           , "rezervisana_rec" ] ,
		[ "order"          , "rezervisana_rec" ] ,
		[ "primary"        , "rezervisana_rec" ] ,
		[ "references"     , "rezervisana_rec" ] ,
		[ "select"         , "rezervisana_rec" ] ,
		[ "set"            , "rezervisana_rec" ] ,
		[ "table"          , "rezervisana_rec" ] ,
		[ "update"         , "rezervisana_rec" ] ,
		[ "use"            , "rezervisana_rec" ] ,
		[ "values"         , "rezervisana_rec" ] ,
		[ "where"          , "rezervisana_rec" ] ,

		/* ----- tipovi podataka ----- */

		[ "where"    , "tip_promenljive" ] ,
		[ "datetime" , "tip_promenljive" ] ,
		[ "double"   , "tip_promenljive" ] ,
		[ "int"      , "tip_promenljive" ] ,
		[ "varchar"  , "tip_promenljive" ] ,

		/* ----- Ugrađene funkcije ----- */

		[ "CONCAT"   , "ugradjena_funkcija" ] ,

	] );

SQL_parserSpecListe.set( 0 , SQL_parserSpecLista_0 );

let SQL_definicijaJezika = {
	
	naziv:                 "SQL",
	defaultKlasa:          "tekst",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          SQL_lekserTokeni,
	maksDuzinaSpajanje:    2,
	kontekstZaGenerike:    -1,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  SQL_parserPrepravljanje,
	parserTokeni:          SQL_parserTokeni,
	parserSpecListe:       SQL_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeNull,
	//pomTekst:              tekstSQL

};

/* -------------------------------------------------------------------------- */
// Jezik -Pyhton
/* -------------------------------------------------------------------------- */

let Python_lekserTokeni = new Map( [
	
	[ "#"  , ""                      ] ,
	[ "("  , "operator"              ] ,
	[ ")"  , "operator"              ] ,
	[ "["  , "otvorena_zagrada_niz"  ] ,
	[ "]"  , "zatvorena_zagrada_niz" ] ,
	[ "\"" , ""                      ] ,
	[ "\'" , ""                      ] ,
	[ "\`" , ""                      ] ,
	[ ":"  , ""                      ] ,
	[ "+"  , ""                      ] ,
	[ "-"  , ""                      ] ,
	[ "*"  , ""                      ] ,
	[ "/"  , ""                      ] ,
	[ "="  , ""                      ] ,
	[ ","  , ""                      ] ,
	[ "."  , ""                      ] ,

] );

let Python_parserPrepravljanje = new Map( [
	
	[ 0 , [ false , false , "identifikator"   ] ] ,
	[ 1 , [ true  , true  , "komentar"        ] ] ,
	[ 2 , [ true  , true  , "niska_apostrofi" ] ] ,
	[ 3 , [ true  , true  , "niska_navodnici" ] ] ,
	[ 4 , [ true  , true  , "niska_backtick"  ] ] ,

] );

let Python_parserTokeni = new Map();
	
	let Python_parserLista_0 = new Map( [
		
		/* ----- promena konteksta ----- */

		[ "#"  , [ true , false , 1 , "komentar"        ] ] ,
		[ "\"" , [ true , false , 2 , "niska_navodnici" ] ] ,
		[ "\'" , [ true , false , 3 , "niska_apostrofi" ] ] ,
		[ "\`" , [ true , false , 4 , "niska_backtick"  ] ] ,

		/* ----- specijalni tokeni ----- */

		[ "=" , [ false , false , -1 , "operator"              ] ] ,
		[ "+" , [ false , false , -1 , "operator"              ] ] ,
		[ "-" , [ false , false , -1 , "operator"              ] ] ,
		[ "/" , [ false , false , -1 , "operator"              ] ] ,
		[ "*" , [ false , false , -1 , "operator"              ] ] ,
		[ "," , [ false , false , -1 , "operator"              ] ] ,
		[ "(" , [ false , false , -1 , "otvorena_zagrada"      ] ] ,
		[ ")" , [ false , false , -1 , "zatvorena_zagrada"     ] ] ,
		[ "[" , [ false , false , -1 , "otvorena_zagrada_niz"  ] ] ,
		[ "]" , [ false , false , -1 , "zatvorena_zagrada_niz" ] ] ,

	] );

	let Python_parserLista_1 = new Map( [
		
		[ "\n" , [ false , true , -1 , "white_space" ] ] ,
	
	] );

	let Python_parserLista_2 = new Map( [
		
		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,
	
	] );
	
	let Python_parserLista_3 = new Map( [
		
		[ "\'" , [ false , true , -1 , "niska_apostrofi" ] ] ,
	
	] );

	let Python_parserLista_4 = new Map( [
		
		[ "\`" , [ false , true , -1 , "niska_backtick" ] ] ,
	
	] );

Python_parserTokeni.set( 0, Python_parserLista_0 )
                   .set( 1, Python_parserLista_1 )
                   .set( 2, Python_parserLista_2 )
                   .set( 3, Python_parserLista_3 )
                   .set( 4, Python_parserLista_4 )

let Python_parserSpecListe = new Map();
	
	let Python_parserSpecLista_0 = new Map( [
		
		/* ----- rezervisane reči ----- */

		[ "False"    , "rezervisana_rec" ] ,
		[ "None"     , "rezervisana_rec" ] ,
		[ "True"     , "rezervisana_rec" ] ,
		[ "and"      , "rezervisana_rec" ] ,
		[ "as"       , "rezervisana_rec" ] ,
		[ "assert"   , "rezervisana_rec" ] ,
		[ "async"    , "rezervisana_rec" ] ,
		[ "await"    , "rezervisana_rec" ] ,
		[ "break"    , "rezervisana_rec" ] ,
		[ "class"    , "rezervisana_rec" ] ,
		[ "continue" , "rezervisana_rec" ] ,
		[ "def"      , "rezervisana_rec" ] ,
		[ "del"      , "rezervisana_rec" ] ,
		[ "elif"     , "rezervisana_rec" ] ,
		[ "else"     , "rezervisana_rec" ] ,
		[ "except"   , "rezervisana_rec" ] ,
		[ "finally"  , "rezervisana_rec" ] ,
		[ "for"      , "rezervisana_rec" ] ,
		[ "from"     , "rezervisana_rec" ] ,
		[ "global"   , "rezervisana_rec" ] ,
		[ "if"       , "rezervisana_rec" ] ,
		[ "import"   , "rezervisana_rec" ] ,
		[ "in"       , "rezervisana_rec" ] ,
		[ "is"       , "rezervisana_rec" ] ,
		[ "lambda"   , "rezervisana_rec" ] ,
		[ "nonlocal" , "rezervisana_rec" ] ,
		[ "not"      , "rezervisana_rec" ] ,
		[ "or"       , "rezervisana_rec" ] ,
		[ "pass"     , "rezervisana_rec" ] ,
		[ "raise"    , "rezervisana_rec" ] ,
		[ "return"   , "rezervisana_rec" ] ,
		[ "try"      , "rezervisana_rec" ] ,
		[ "while"    , "rezervisana_rec" ] ,
		[ "with"     , "rezervisana_rec" ] ,
		[ "yield"    , "rezervisana_rec" ] ,

		/* ----- specijalni tokeni ----- */
	
		[ "append"   , "specijalni_token" ] ,
		[ "close"    , "specijalni_token" ] ,
		[ "decode"   , "specijalni_token" ] ,
		[ "len"      , "specijalni_token" ] ,
		[ "open"     , "specijalni_token" ] ,
		[ "pop"      , "specijalni_token" ] ,
		[ "read"     , "specijalni_token" ] ,
		[ "replace"  , "specijalni_token" ] ,
		[ "split"    , "specijalni_token" ] ,
		[ "write"    , "specijalni_token" ] ,

	] );

Python_parserSpecListe.set( 0 , Python_parserSpecLista_0 );

let Python_definicijaJezika = {
	
	naziv:                 "Python",
	defaultKlasa:          "identifikator",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          Python_lekserTokeni,
	maksDuzinaSpajanje:    1,
	kontekstZaGenerike:    0,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  Python_parserPrepravljanje,
	parserTokeni:          Python_parserTokeni,
	parserSpecListe:       Python_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeNull,
	//pomTekst:              tekstPython

}

/* -------------------------------------------------------------------------- */
// Jezik - PHP
/* -------------------------------------------------------------------------- */

let PHP_lekserTokeni = new Map( [
	
	[ "<"  , "operator" ] ,
	[ "?"  , "operator" ] ,
	[ "!"  , "komentar" ] ,
	[ ">"  , "operator" ] ,
	[ "/"  , "komentar" ] ,
	[ "*"  , "komentar" ] ,
	[ "+"  , "operator" ] ,
	[ "-"  , "operator" ] ,
	[ "="  , "operator" ] ,
	[ "{"  , ""         ] ,
	[ "}"  , ""         ] ,
	[ "("  , ""         ] ,
	[ ")"  , ""         ] ,
	[ "["  , ""         ] ,
	[ "]"  , ""         ] ,
	[ ";"  , ""         ] ,
	[ ","  , ""         ] ,
	[ "."  , ""         ] ,
	[ "\"" , ""         ] ,
	[ "\\" , ""         ] ,
	[ "\n" , ""         ] ,
	[ "\"" , ""         ] ,
	[ "\'" , ""         ] ,
	[ "\`" , ""         ] ,
	[ "^"  , ""         ] ,
	[ "|"  , ""         ] ,
	[ "~"  , ""         ] ,

	/* ----- HTMl deo ----- */

	[ "</" , "html_tag" ] ,
	[ "/>" , "html_tag" ] ,
	[ "<!" , "komentar" ] ,
	[ "->" , "komentar" ] ,

	/* ----- PHP blok ----- */

	[ "<?" , "php_blok" ] ,
	[ "?>" , "php_blok" ] ,

	/* ----- komentari ----- */
	
	[ "/*" , "komentar" ] ,
	[ "*/" , "komentar" ] ,
	[ "//" , "komentar" ] ,
	
	/* ----- operatori ----- */	
	
	[ "!="  , "operator" ] ,
	[ "&&"  , "operator" ] ,
	[ "++"  , "operator" ] ,
	[ "--"  , "operator" ] ,
	[ "<="  , "operator" ] ,
	[ "=="  , "operator" ] ,
	[ ">="  , "operator" ] ,
	[ "<<<" , "operator" ] ,

] );

let PHP_parserPrepravljanje = new Map( [
	
	/* ----- HTML blok ----- */

	[ 0 , [ true  , true  , "tekst"           ] ] ,
	[ 1 , [ true  , true  , "html_tag"        ] ] ,
	[ 2 , [ false , true  , "atribut_naziv"   ] ] ,
	[ 3 , [ true  , true  , "niska_apostrofi" ] ] ,
	[ 4 , [ true  , true  , "niska_navodnici" ] ] ,
	[ 5 , [ true  , true  , "komentar"        ] ] ,

	/* ----- PHP blok ----- */

	[ 10 , [ false , true , "identifikator"   ] ] ,
	[ 11 , [ true  , true , "komentar"        ] ] ,
	[ 12 , [ true  , true , "komentar"        ] ] ,
	[ 13 , [ true  , true , "niska_apostrofi" ] ] ,
	[ 14 , [ true  , true , "niska_navodnici" ] ] ,
	[ 15 , [ true  , true , "niska_backtick"  ] ] ,
	[ 16 , [ true  , true , "heredoc_nowdoc"  ] ] ,

] );

let PHP_parserTokeni = new Map();
	
	let PHP_parserLista_0 = new Map( [
		
		/* ----- Promena konteksta i prepoznavanje PHP bloka ----- */

		[ "<"  , [ true , false ,  1 , "html_tag" ] ] ,
		[ "</" , [ true , false ,  1 , "html_tag" ] ] ,
		[ "<!" , [ true , false ,  5 , "komentar" ] ] ,
		[ "<?" , [ true , false , 10 , "php_blok" ] ] ,

	] );

	let PHP_parserLista_1 = new Map( [
		
		[ " "  , [ true  , true  ,  2 , "white_space" ] ] ,
		[ "\t" , [ true  , true  ,  2 , "white_space" ] ] ,
		[ ">"  , [ false , true  , -1 , "html_tag"    ] ] ,
		[ "/>" , [ false , true  , -1 , "html_tag"    ] ] ,
		[ "<?" , [ true  , false , 10 , "php_blok"    ] ] ,
	
	] );
	
	let PHP_parserLista_2 = new Map( [
		
		[ " "  , [ false , false , -1 , "white_space"     ] ] ,
		[ ">"  , [ false , true  , -1 , "html_tag"        ] ] ,
		[ "/>" , [ false , true  , -1 , "html_tag"        ] ] ,
		[ "="  , [ false , false , -1 , "atribut_dodela"  ] ] ,
		[ "\'" , [ true  , false ,  3 , "niska_apostrofi" ] ] ,
		[ "\"" , [ true  , false ,  4 , "niska_navodnici" ] ] ,
		[ "<?" , [ true  , false , 10 , "php_blok"    ] ] ,
	
	] );


	let PHP_parserLista_3 = new Map( [
		
		[ "\'" , [ false , true , -1 , "niska_apostrofi" ] ] ,
	
	] );
		
	let PHP_parserLista_4 = new Map( [
		
		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,
	
	] );
		
	let PHP_parserLista_5 = new Map( [
		
		[ "->" , [ false , true , -1 , "komentar" ] ] ,
		[ ">"  , [ false , true , -1 , "komentar" ] ] ,
	
	] );

	/* ------------------------------------------------------------------ */
	// PHP blok:
	/* ------------------------------------------------------------------ */
	
	let PHP_parserLista_10 = new Map( [

		/* ----- Promena konteksta ----- */

		[ "/*"  , [ true  , false , 11, "komentar"        ] ] ,
		[ "//"  , [ true  , false , 12, "komentar"        ] ] ,
		[ "\""  , [ true  , false , 13, "niska_navodnici" ] ] ,
		[ "'"   , [ true  , false , 14, "niska_apostrofi" ] ] ,
		[ "`"   , [ true  , false , 15, "niska_backtick"  ] ] ,
		[ "->"  , [ false , false , -1, "operator"        ] ] ,
		[ "<<<" , [ true  , false , 16, "heredoc_nowdoc"  ] ] ,
		[ "?>"  , [ false , true  , -1, "php_blok"        ] ] ,

	] );

	let PHP_parserLista_11 = new Map( [
		
		[ "*/" , [ false , true , -1 , "komentar" ] ] ,
	
	] );

	let PHP_parserLista_12 = new Map( [
		
		[ "\n" , [ false , true , -1 , "white_space" ] ] ,
	
	] );
	
	let PHP_parserLista_13 = new Map( [
		
		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,
	
	] );
	
	let PHP_parserLista_14 = new Map( [
		
		[ "'"  , [ false , true , -1 , "niska_apostrofi" ] ] ,
	
	] );
	
	let PHP_parserLista_15 = new Map( [
		
		[ "`"  , [ false , true , -1 , "niska_backtick" ] ] ,
	
	] );

	let PHP_parserLista_16 = new Map( [
		
		[ ";"  , [ false , true , -1 , "operator" ] ] ,
	
	] );

/* ----- (praktično) HTML ----- */

PHP_parserTokeni.set( 0 , PHP_parserLista_0 )
                .set( 1 , PHP_parserLista_1 )
                .set( 2 , PHP_parserLista_2 )
                .set( 3 , PHP_parserLista_3 )
                .set( 4 , PHP_parserLista_4 )
                .set( 5 , PHP_parserLista_5 )

/* ----- PHP blok ----- */

                .set( 10 , PHP_parserLista_10 )
                .set( 11 , PHP_parserLista_11 )
                .set( 12 , PHP_parserLista_12 )
                .set( 13 , PHP_parserLista_13 )
                .set( 14 , PHP_parserLista_14 )
                .set( 15 , PHP_parserLista_15 )
                .set( 16 , PHP_parserLista_16 )

let PHP_parserSpecListe = new Map();
	
	let PHP_parserSpecLista_10 = new Map( [

		/* ----- rezervisane_reci ----- */

		[ "__halt_compiler" , "rezervisana_rec" ] ,
		[ "abstract"        , "rezervisana_rec" ] ,
		[ "and"             , "rezervisana_rec" ] ,
		[ "array"           , "rezervisana_rec" ] ,
		[ "as"              , "rezervisana_rec" ] ,
		[ "break"           , "rezervisana_rec" ] ,
		[ "callable"        , "rezervisana_rec" ] ,
		[ "case"            , "rezervisana_rec" ] ,
		[ "catch"           , "rezervisana_rec" ] ,
		[ "class"           , "rezervisana_rec" ] ,
		[ "clone"           , "rezervisana_rec" ] ,
		[ "const"           , "rezervisana_rec" ] ,
		[ "continue"        , "rezervisana_rec" ] ,
		[ "declare"         , "rezervisana_rec" ] ,
		[ "default"         , "rezervisana_rec" ] ,
		[ "die"             , "rezervisana_rec" ] ,
		[ "do"              , "rezervisana_rec" ] ,
		[ "echo"            , "rezervisana_rec" ] ,
		[ "else"            , "rezervisana_rec" ] ,
		[ "elseif"          , "rezervisana_rec" ] ,
		[ "empty"           , "rezervisana_rec" ] ,
		[ "enddeclare"      , "rezervisana_rec" ] ,
		[ "endfor"          , "rezervisana_rec" ] ,
		[ "endforeach"      , "rezervisana_rec" ] ,
		[ "endif"           , "rezervisana_rec" ] ,
		[ "endswitch"       , "rezervisana_rec" ] ,
		[ "endwhile"        , "rezervisana_rec" ] ,
		[ "eval"            , "rezervisana_rec" ] ,
		[ "exit"            , "rezervisana_rec" ] ,
		[ "extends"         , "rezervisana_rec" ] ,
		[ "final"           , "rezervisana_rec" ] ,
		[ "finally"         , "rezervisana_rec" ] ,
		[ "fn"              , "rezervisana_rec" ] ,
		[ "for"             , "rezervisana_rec" ] ,
		[ "foreach"         , "rezervisana_rec" ] ,
		[ "function"        , "rezervisana_rec" ] ,
		[ "global"          , "rezervisana_rec" ] ,
		[ "goto"            , "rezervisana_rec" ] ,
		[ "if"              , "rezervisana_rec" ] ,
		[ "implements"      , "rezervisana_rec" ] ,
		[ "include"         , "rezervisana_rec" ] ,
		[ "include_once"    , "rezervisana_rec" ] ,
		[ "instanceof"      , "rezervisana_rec" ] ,
		[ "insteadof"       , "rezervisana_rec" ] ,
		[ "interface"       , "rezervisana_rec" ] ,
		[ "isset"           , "rezervisana_rec" ] ,
		[ "list"            , "rezervisana_rec" ] ,
		[ "match"           , "rezervisana_rec" ] ,
		[ "namespace"       , "rezervisana_rec" ] ,
		[ "new"             , "rezervisana_rec" ] ,
		[ "or"              , "rezervisana_rec" ] ,
		[ "print"           , "rezervisana_rec" ] ,
		[ "private"         , "rezervisana_rec" ] ,
		[ "protected"       , "rezervisana_rec" ] ,
		[ "public"          , "rezervisana_rec" ] ,
		[ "require"         , "rezervisana_rec" ] ,
		[ "require_once"    , "rezervisana_rec" ] ,
		[ "return"          , "rezervisana_rec" ] ,
		[ "static"          , "rezervisana_rec" ] ,
		[ "switch"          , "rezervisana_rec" ] ,
		[ "throw"           , "rezervisana_rec" ] ,
		[ "trait"           , "rezervisana_rec" ] ,
		[ "try"             , "rezervisana_rec" ] ,
		[ "unset"           , "rezervisana_rec" ] ,
		[ "use"             , "rezervisana_rec" ] ,
		[ "var"             , "rezervisana_rec" ] ,
		[ "while"           , "rezervisana_rec" ] ,
		[ "xor"             , "rezervisana_rec" ] ,
		[ "yield"           , "rezervisana_rec" ] ,
		[ "yield from"      , "rezervisana_rec" ] ,
		
		/* ----- specijalni tokeni ----- */

		[ "$_COOKIE"                  , "specijalni_token" ] ,
		[ "$_GET"                     , "specijalni_token" ] ,
		[ "$_POST"                    , "specijalni_token" ] ,
		[ "$_SERVER"                  , "specijalni_token" ] ,
		[ "$_SESSION"                 , "specijalni_token" ] ,
		[ "$this"                     , "specijalni_token" ] ,
		[ "__construct"               , "specijalni_token" ] ,
		[ "abs"                       , "specijalni_token" ] ,
		[ "exit"                      , "specijalni_token" ] ,
		[ "fclose"                    , "specijalni_token" ] ,
		[ "header"                    , "specijalni_token" ] ,
		[ "htmlentities"              , "specijalni_token" ] ,
		[ "isset"                     , "specijalni_token" ] ,
		[ "json_encode"               , "specijalni_token" ] ,
		[ "mysqli_close"              , "specijalni_token" ] ,
		[ "mysqli_connect"            , "specijalni_token" ] ,
		[ "mysqli_fetch_assoc"        , "specijalni_token" ] ,
		[ "mysqli_num_rows"           , "specijalni_token" ] ,
		[ "mysqli_query"              , "specijalni_token" ] ,
		[ "mysqli_real_escape_string" , "specijalni_token" ] ,
		[ "mysqli_stmt_bind_param"    , "specijalni_token" ] ,
		[ "mysqli_stmt_execute"       , "specijalni_token" ] ,
		[ "mysqli_prepare"            , "specijalni_token" ] ,
		[ "password_hash"             , "specijalni_token" ] ,
		[ "pregmatch"                 , "specijalni_token" ] ,
		[ "rand"                      , "specijalni_token" ] ,
		[ "session_start"             , "specijalni_token" ] ,
		[ "set_cookie"                , "specijalni_token" ] ,
		[ "sqrt"                      , "specijalni_token" ] ,
		[ "str_replace"               , "specijalni_token" ] ,
		[ "strlen"                    , "specijalni_token" ] ,
		[ "trim"                      , "specijalni_token" ] ,
		[ "unset"                     , "specijalni_token" ] ,

		[ "php"                       , "php_blok"         ] ,

	] );

PHP_parserSpecListe.set( 10 , PHP_parserSpecLista_10 );

let PHP_definicijaJezika = {
	naziv:                 "PHP",
	defaultKlasa:          "tekst",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          PHP_lekserTokeni,
	maksDuzinaSpajanje:    3,
	kontekstZaGenerike:    10,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  PHP_parserPrepravljanje,
	parserTokeni:          PHP_parserTokeni,
	parserSpecListe:       PHP_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeNull,
	/* pomTekst:              tekstPHP */
};

/* -------------------------------------------------------------------------- */
// Jezik - JSON
/* -------------------------------------------------------------------------- */

// let JSON_lekserTokeni = new Map( [
// 	[ "{" ,  "" ] ,
// 	[ "}" ,  "" ] ,
// 	[ "\"" , "" ] ,
// 	[ ":" ,  "" ] ,
// 	[ "[" ,  "" ] ,
// 	[ "]" ,  "" ] ,
// 	[ "," ,  "" ] ,
// 	[ "'" ,  "" ] ,
// 	[ "`" ,  "" ] ,
// ] );
//
// let JSON_parserPrepravljanje = new Map( [
// 	[ 0 ,  [ false , false , "tekst"             ] ] ,
// 	[ 10 , [ false , true  , "svojstvo_naziv"    ] ] ,
// 	[ 20 , [ false , false , "svojstvo_vrednost" ] ] ,
// 	[ 30 , [ true  , true  , "niska_apostrofi"   ] ] ,
// 	[ 40 , [ true  , true  , "niska_navodnici"   ] ] ,
// 	[ 50 , [ true  , true  , "niska_backtick"    ] ] ,
// 	[ 60 , [ false , false , "niz"               ] ] ,
// ] );
//
// const JSON_parserTokeni = new Map();
// 	
// 	const JSON_parserLista_0 = new Map( [
// 		/* ----- promena konteksta ----- */
// 		[ "{"  , [ true , false , 10 , "json_obj_zagrada_otvorena" ] ] ,
// 	] );
//
// 	const JSON_parserLista_10 = new Map( [
// 		[ ":" , [ true  , false , 20 , "svojstvo_dodela"   ] ] ,
// 	] );
//
//
// 	const JSON_parserLista_20 = new Map( [
// 		[ "{"  , [ true  , false , 10 , "json_obj_zagrada_otvorena"  ] ] ,
// 		[ "'" ,  [ true  , false , 30 , "niska_apostrofi"            ] ] ,
// 		[ "\"" , [ true  , false , 40 , "niska_navodnici"            ] ] ,
// 		[ "`" ,  [ true  , false , 50 , "niska_backtick"             ] ] ,
// 		[ "[" ,  [ true  , false , 60 , "niz_zagrada"                ] ] ,
// 		[ ","  , [ false , true  , -1 , "operator"                   ] ] ,
// 		[ "}"  , [ false , true  , -1 , "json_obj_zagrada_zatvorena" ] ] ,
// 	] );
//
// 	const JSON_parserLista_30 = new Map( [
// 		[ "'" , [ false , true , -1 ,  "niska_apostrofi" ] ] ,
// 	] );
//
// 	const JSON_parserLista_40 = new Map( [
// 		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,
// 	] );
//
// 	const JSON_parserLista_50 = new Map( [
// 		[ "`" , [ false , true , -1 ,  "niska_backtick" ] ] ,
// 	] );
//
// 	const JSON_parserLista_60 = new Map( [
// 		[ "{"  , [ true  , false , 10 , "json_obj_zagrada_X"   ] ] ,
// 		[ "["  , [ true  , false , 60 , "niz_zagrada_otvorena" ] ] ,
// 		[ "'"  , [ true  , false , 30 , "niska_apostrofi"      ] ] ,
// 		[ "\"" , [ true  , false , 40 , "niska_navodnici"      ] ] ,
// 		[ "`"  , [ true  , false , 50 , "niska_backtick"       ] ] ,
// 		[ ","  , [ false , true  , -1 , "operator"             ] ] ,
// 		[ "]"  , [ false , true  , -1 , "niz_zagrada"          ] ] ,
// 	] );
//
// JSON_parserTokeni.set( 0 ,  JSON_parserLista_0 )
//                  .set( 10 , JSON_parserLista_10 )
//                  .set( 20 , JSON_parserLista_20 )
//                  .set( 30 , JSON_parserLista_30 )
//                  .set( 40 , JSON_parserLista_40 )
//                  .set( 50 , JSON_parserLista_50 )
//                  .set( 60 , JSON_parserLista_60 )
//
// const JSON_parserSpecListe = new Map();
//
// 	const JSON_parserSpecListe_20 = new Map( [
// 		[ "true"   , "rezervisana_rec"  ] ,
// 		[ "false"  , "rezervisana_rec"  ] ,
// 		[ "null"   , "specijalni_token" ] ,
// 	] );
//
// JSON_parserSpecListe.set(20, JSON_parserSpecListe_20);
//
// const JSON_definicijaJezika = {
// 	naziv:                 "JSON",
// 	defaultKlasa:          "tekst",
// 	lekser:                lekserOpsti,
// 	parser:                parserOpsti,
// 	lekserTokeni:          JSON_lekserTokeni,
// 	maksDuzinaSpajanje:    1,
// 	kontekstZaGenerike:    -1,
// 	kontekstZaRegex:       -1,
// 	parserPrepravaljanje:  JSON_parserPrepravljanje,
// 	parserTokeni:          JSON_parserTokeni,
// 	parserSpecListe:       JSON_parserSpecListe,
// 	funkcijaPrepravke:     funkcijaPrepravkeNull,
// 	/* pomTekst:              tekstSQL */
// };

/* -------------------------------------------------------------------------- */
// Jezik - Assembler
/* -------------------------------------------------------------------------- */

let Assembler_regexRastavljanje = /(\,|\n| |0x\d+|^\d*\.\d+|^\d+)/g;

let Assembler_listaRegex = [
	[  /0x\d+/g     ,  "assembler_adresa"    ,  true  , false  ]  ,
	[  /\,| /g      ,  "separator"           ,  true  , false  ]  ,
	[  /\d*\.\d+/g  ,  "decimalna_vrednost"  ,  true  , false  ]  ,
	[  /\d+/g       ,  "brojcana_vrednost"   ,  true  , false  ]  ,
];

let Assembler_listaParser = [

];

let Assembler_naredbe = [
	"acc",
	"add",
	"div",
	"jnc",
	"mov",
];

let Assembler_registri = [
	"R1",
	"R2",
	"R3",
];

let Assembler_specijalneListe = [
	[ // 0
		[  Assembler_naredbe   ,  "assembler_naredba"   ,  -1  ]  ,
		[  Assembler_registri  ,  "assembler_registar"  ,  -1  ]  ,
	]
];

let Assembler_definicijaJezika = {
	naziv:              "Assembler",
	lekser:             lekserRegex,
	parser:             parserRegex,
	regexRastavljanje:  Assembler_regexRastavljanje,
	listaRegex:         Assembler_listaRegex,
	listaParser:        Assembler_listaParser,
	listeSpec:          Assembler_specijalneListe,
	funkcijaPrepravke:  funkcijaPrepravkeNull,
}

/* -------------------------------------------------------------------------- */
// Jezik - JSON
/* -------------------------------------------------------------------------- */

let JSON_regexRastavljanje = /(\s|\\"|"|\{|\}|\[|\]|:|,)/g

let JSON_listaRegex = [
	[ /\{|\}/g     ,  "json_obj_zagrada" , true , false ] ,
	[ /\[|\]/g     ,  "niz_zagrada"      , true , false ] ,
	[ /,/g         ,  "operator"         , true , false ] ,
	[ /\d*\.*\d+/g ,  "broj"             , true , false ] ,
	[ /null/g ,       "specijalni_token" , true , false ] ,
	[ /true|false/g , "boolean"          , true , false ] ,
];

let JSON_listaParser = [

];

let JSON_specijalneListe = [

];

let JSON_definicijaJezika = {
	naziv:              "JSON",
	lekser:             lekserRegex,
	parser:             parserRegex,
	regexRastavljanje:  JSON_regexRastavljanje,
	listaRegex:         JSON_listaRegex,
	listaParser:        JSON_listaParser,
	listeSpec:          JSON_specijalneListe,
	funkcijaPrepravke:  funkcijaPrepravkeJson,
}

/* -------------------------------------------------------------------------- */
// Jezik - Markup
/* -------------------------------------------------------------------------- */

let Markup_regexRastavljanje = /(######.+?\n|#####.+?\n|####.+?\n|###.+?\n|##.+?\n|#.+?\n|\*[\s\S]*?\*\*)/g;

let Markup_listaRegex = [
	
	[ /(######.+?\n)/g    , "markup_naslov_h6" , true , false ] ,
	[ /(#####.+?\n)/g     , "markup_naslov_h5" , true , false ] ,
	[ /(####.+?\n)/g      , "markup_naslov_h4" , true , false ] ,
	[ /(###.+?\n)/g       , "markup_naslov_h3" , true , false ] ,
	[ /(##.+?\n)/g        , "markup_naslov_h2" , true , false ] ,
	[ /(#.+?\n)/g         , "markup_naslov_h1" , true , false ] ,
	[ /(\*[\s\S]*?\*\*)/g , "markup_lista"     , true , false ] ,

];

let Markup_listaParser = [

];

let Markup_specijalneListe = [
	
];

let Markup_definicijaJezika = {
	
	naziv:              "Markup",
	lekser:             lekserRegex,
	parser:             parserRegex,
	regexRastavljanje:  Markup_regexRastavljanje,
	listaRegex:         Markup_listaRegex,
	listaParser:        Markup_listaParser,
	listeSpec:          Markup_specijalneListe,
	funkcijaPrepravke:  funkcijaPrepravkeNull,

}

/* -------------------------------------------------------------------------- */
// Jezik: RegEx
/* -------------------------------------------------------------------------- */

let RegEx_regexRastavljanje = /(\/\(|\)\/|\)\/g|\)\/gm|\\.{1}|\{.*?\}|\+|\?|\*|\\w|\\W|\\b|\\B\\c|\\C|\\s|\\S|\\d|\\D|\||\[|\]|\(|\))/g;

let RegEx_listaRegex = [
	
	[ /\/\(/g                                   , "regex_pocetak"       , true , false ] ,
	[ /\)\/|\)\/g|\)\/gm/g                      , "regex_kraj"          , true , false ] ,
	[ /\\.{1}/g                                 , "regex_escape"        , true , false ] ,
	[ /\{.*?\}|\+|\?|\*/g                       , "regex_kvantifikator" , true , false ] ,
	[ /\\w|\\W|\\b|\\B\\c|\\C|\\s|\\S|\\d|\\D/g , "regex_klase_znakova" , true , false ] ,
	[ /\||\[|\]|\(|\)/g                         , "operator"            , true , false ] ,

];

let RegEx_listaParser = [

];

let RegEx_specijalneListe = [
	
];

let RegEx_definicijaJezika = {
	
	naziv:              "RegEx",
	lekser:             lekserRegex,
	parser:             parserRegex,
	regexRastavljanje:  RegEx_regexRastavljanje,
	listaRegex:         RegEx_listaRegex,
	listaParser:        RegEx_listaParser,
	listeSpec:          RegEx_specijalneListe,
	funkcijaPrepravke:  funkcijaPrepravkeNull,

}

/* -------------------------------------------------------------------------- */
// Jezik - shell
/* -------------------------------------------------------------------------- */

let Shell_lekserTokeni = new Map( [

	[ "##" , "sudo_naredba"          ] ,
	[ "#"  , ""                      ] ,
	[ "("  , "zagrada"               ] ,
	[ ")"  , "zagrada"               ] ,
	[ "["  , "conditional_zagrada"   ] ,
	[ "]"  , "conditional_zagrada"   ] ,
	[ "|"  , "pajp_simbol"           ] ,
	[ ">>" , "redirekcija_append"    ] ,
	[ "<<" , "redirekcija_append"    ] ,
	[ "<"  , "redirekcija_overwrite" ] ,
	[ ">"  , "redirekcija_overwrite" ] ,
	[ "&"  , "operator"              ] ,
	[ "&&" , "operator"              ] ,
	[ "="  , "operator"              ] ,
	[ "--" , ""                      ] ,
	[ "$"  , ""                      ] ,
	[ "\"" , ""                      ] ,
	[ "\'" , ""                      ] ,
	[ "\`" , ""                      ] ,
	[ ":"  , ""                      ] ,
	[ ";"  , ""                      ] ,
	[ "+"  , "operator"              ] ,
	[ "-"  , ""                      ] ,
	[ "*"  , "operator"              ] ,
	[ "/"  , "operator"              ] ,
	[ ","  , ""                      ] ,
	[ "."  , ""                      ] ,
	[ "~"  , ""                      ] ,

] );

let Shell_parserPrepravljanje = new Map( [
	
	[ 0 , [ false , false , "identifikator"   ] ] ,
	[ 1 , [ true  , true  , "komentar"        ] ] ,
	[ 2 , [ true  , true  , "niska_navodnici" ] ] ,
	[ 3 , [ true  , true  , "niska_apostrofi" ] ] ,
	[ 4 , [ true  , true  , "niska_backtick"  ] ] ,
	[ 5 , [ true  , true  , "putanja"         ] ] ,
	[ 6 , [ true  , true  , "flag_unix"       ] ] ,
	[ 7 , [ true  , true  , "flag_gnu"        ] ] ,
	[ 8 , [ true  , true  , "variable"        ] ] ,

] );

let Shell_parserTokeni = new Map();
	
	let Shell_parserLista_0 = new Map( [
		
		/* ----- promena konteksta ----- */

		// [ "("  , [ true , false ,  0 , "zagrada"         ] ] ,
		// [ ")"  , [ true , false , -1 , "zagrada"         ] ] ,
		[ "#"  , [ true , false ,  1 , "komentar"        ] ] ,
		[ "\"" , [ true , false ,  2 , "niska_navodnici" ] ] ,
		[ "\'" , [ true , false ,  3 , "niska_apostrofi" ] ] ,
		[ "\`" , [ true , false ,  4 , "niska_backtick"  ] ] ,
		[ "/" ,  [ true , false ,  5 , "putanja"         ] ] ,
		[ "~" ,  [ true , false ,  5 , "putanja"         ] ] ,
		[ "." ,  [ true , false ,  5 , "putanja"         ] ] ,
		[ "-" ,  [ true , false ,  6 , "flag_unix"       ] ] ,
		[ "--" , [ true , false ,  7 , "flag_gnu"        ] ] ,
		[ "$"  , [ true , false ,  8 , "var_dolar"       ] ] ,

		/* ----- specijalni tokeni ----- */

		// [ ">>" , [ false , false , -1 , "redirekcija_append"   ] ] ,
		[ ">"  , [ false , false , -1 , "redirekcija_overwrite"   ] ] ,
		[ "<"  , [ false , false , -1 , "redirekcija_overwrite"   ] ] ,
		// [ "=" , [ false , false , -1 , "operator"              ] ] ,
		// [ "+" , [ false , false , -1 , "operator"              ] ] ,
		// [ "*" , [ false , false , -1 , "operator"              ] ] ,
		// [ "," , [ false , false , -1 , "operator"              ] ] ,

	] );

	let Shell_parserLista_1 = new Map( [
		
		[ "\n" , [ false , true , -1 , "white_space" ] ] ,
	
	] );

	let Shell_parserLista_2 = new Map( [
		
		[ "\"" , [ false , true , -1 , "niska_navodnici" ] ] ,
	
	] );
	
	let Shell_parserLista_3 = new Map( [
		
		[ "\'" , [ false , true , -1 , "niska_apostrofi" ] ] ,
	
	] );

	let Shell_parserLista_4 = new Map( [
		
		[ "\`" , [ false , true , -1 , "niska_backtick" ] ] ,
	
	] );

	let Shell_parserLista_5 = new Map( [
		
		[ " " ,  [ false , true , -1 , "white_space" ] ] ,
		[ "\t" , [ false , true , -1 , "white_space" ] ] ,
		[ "\r" , [ false , true , -1 , "white_space" ] ] ,
		[ "\n" , [ false , true , -1 , "white_space" ] ] ,
		[ "("  , [ false , true , -1 , "zagrada"     ] ] ,
		[ ")"  , [ false , true , -1 , "zagrada"     ] ] ,
	
	] );

	let Shell_parserLista_6 = new Map( [
		
		[ " " ,  [ false , true , -1 , "flag_unix"   ] ] ,
		[ "\t" , [ false , true , -1 , "flag_unix"   ] ] ,
		[ "\r" , [ false , true , -1 , "white_space" ] ] ,
		[ "\n" , [ false , true , -1 , "white_space" ] ] ,
	
	] );

	let Shell_parserLista_7 = new Map( [
		
		[ " " ,  [ false , true , -1 , "flag_gnu"    ] ] ,
		[ "\t" , [ false , true , -1 , "flag_gnu"    ] ] ,
		[ "\r" , [ false , true , -1 , "white_space" ] ] ,
		[ "\n" , [ false , true , -1 , "white_space" ] ] ,
	
	] );

	let Shell_parserLista_8 = new Map( [
		
		[ ")" ,  [ false , true , -1 , "zagrada"  ] ] ,
		[ "(" ,  [ false , true ,  0 , "zagrada"  ] ] ,
		[ "=" ,  [ false , true , -1 , "operator" ] ] ,
		[ "*" ,  [ false , true , -1 , "operator" ] ] ,
		[ " " ,  [ false , true , -1 , "variable" ] ] ,
		[ "\t" , [ false , true , -1 , "variable" ] ] ,
		[ "\r" , [ false , true , -1 , "variable" ] ] ,
		[ "\n" , [ false , true , -1 , "variable" ] ] ,
	
	] );

Shell_parserTokeni.set( 0, Shell_parserLista_0 )
                  .set( 1, Shell_parserLista_1 )
                  .set( 2, Shell_parserLista_2 )
                  .set( 3, Shell_parserLista_3 )
                  .set( 4, Shell_parserLista_4 )
                  .set( 5, Shell_parserLista_5 )
                  .set( 6, Shell_parserLista_6 )
                  .set( 7, Shell_parserLista_7 )
                  .set( 8, Shell_parserLista_8 )

let Shell_parserSpecListe = new Map();
	
	let Shell_parserSpecLista_0 = new Map( [
		
		/* ----- GNU UTILS ----- */

		[ "sudo"   , "gnu_utils_spec_2" ] ,

		[ "alias"    , "gnu_utils" ] ,
		[ "awk"      , "gnu_utils" ] ,
		[ "cat"      , "gnu_utils" ] ,
		[ "chmod"    , "gnu_utils" ] ,
		[ "chown"    , "gnu_utils" ] ,
		[ "cd"       , "gnu_utils" ] ,
		[ "cp"       , "gnu_utils" ] ,
		[ "crontab"  , "gnu_utils" ] ,
		[ "date"     , "gnu_utils" ] ,
		[ "df"       , "gnu_utils" ] ,
		[ "du"       , "gnu_utils" ] ,
		[ "echo"     , "gnu_utils" ] ,
		[ "free"     , "gnu_utils" ] ,
		[ "grep"     , "gnu_utils" ] ,
		[ "ls"       , "gnu_utils" ] ,
		[ "lsblk"    , "gnu_utils" ] ,
		[ "man"      , "gnu_utils" ] ,
		[ "mv"       , "gnu_utils" ] ,
		[ "mkdir"    , "gnu_utils" ] ,
		[ "mount"    , "gnu_utils" ] ,
		[ "read"     , "gnu_utils" ] ,
		[ "rm"       , "gnu_utils" ] ,
		[ "sleep"    , "gnu_utils" ] ,
		[ "sort"     , "gnu_utils" ] ,
		[ "test"     , "gnu_utils" ] ,
		[ "time"     , "gnu_utils" ] ,
		[ "top"      , "gnu_utils" ] ,
		[ "touch"    , "gnu_utils" ] ,
		[ "unalias"  , "gnu_utils" ] ,
		[ "umount"   , "gnu_utils" ] ,
		[ "xsetroot" , "gnu_utils" ] ,
		[ "watch"    , "gnu_utils" ] ,
		/* ----- */
		[ "rename"   , "util_linux" ] ,

		/* ----- Prepoznati programi ----- */

		[ "pacman"  , "prepoznat_program" ] ,
		[ "vim"     , "prepoznat_program" ] ,

		/* ----- Rezervisane reči ----- */

		[ "if"    , "rezervisana_rec" ] ,
		[ "fi"    , "rezervisana_rec" ] ,
		[ "elif"  , "rezervisana_rec" ] ,
		[ "else"  , "rezervisana_rec" ] ,
		[ "case"  , "rezervisana_rec" ] ,
		[ "esac"  , "rezervisana_rec" ] ,
		[ "for"   , "rezervisana_rec" ] ,
		[ "while" , "rezervisana_rec" ] ,
		[ "then"  , "rezervisana_rec" ] ,
		[ "in"    , "rezervisana_rec" ] ,
		[ "do"    , "rezervisana_rec" ] ,
		[ "done"  , "rezervisana_rec" ] ,

		/* ----- Rezervisane reči ----- */

		[ "true"  , "spec_token"      ] ,
		[ "false" , "spec_token"      ] ,

	] );

Shell_parserSpecListe.set( 0 , Shell_parserSpecLista_0 );

let Shell_definicijaJezika = {
	
	naziv:                 "Shell",
	defaultKlasa:          "identifikator",
	lekser:                lekserOpsti,
	parser:                parserOpsti,
	lekserTokeni:          Shell_lekserTokeni,
	maksDuzinaSpajanje:    2,
	kontekstZaGenerike:    -1,
	kontekstZaRegex:       -1,
	parserPrepravaljanje:  Shell_parserPrepravljanje,
	parserTokeni:          Shell_parserTokeni,
	parserSpecListe:       Shell_parserSpecListe,
	funkcijaPrepravke:     funkcijaPrepravkeShell,
	//pomTekst:              tekstPython

}
/* -------------------------------------------------------------------------- */

let mapaKlasa = new Map();

mapaKlasa.set("language-text",       TXT_definicijaJezika)
         .set("language-shellsym",   ShellSym_definicijaJezika)
         .set("language-assembler",  Assembler_definicijaJezika)
         .set("language-c",          C_definicijaJezika)
         .set("language-clike",      CLIKE_definicijaJezika)
         .set("language-cpp",        CPP_definicijaJezika)
         .set("language-csharp",     C_Sharp_definicijaJezika)
         .set("language-css",        CSS_definicijaJezika)
         .set("language-html",       HTML_definicijaJezika)
         .set("language-java",       Java_definicijaJezika)
         .set("language-javascript", JavaScript_definicijaJezika)
         .set("language-json",       JSON_definicijaJezika)
         .set("language-markup",     Markup_definicijaJezika)
         .set("language-php",        PHP_definicijaJezika)
         .set("language-python",     Python_definicijaJezika)
         .set("language-regex",      RegEx_definicijaJezika)
         .set("language-sql",        SQL_definicijaJezika)
         .set("language-xml",        XML_definicijaJezika)
         .set("language-shell",      Shell_definicijaJezika)

let spisakKlasa = [
	"language-text",
	"language-shellsym",
	"language-assembler",
	"language-c",
	"language-clike",
	"language-cpp",
	"language-csharp",
	"language-css",
	"language-html",
	"language-java",
	"language-javascript",
	"language-json",
	"language-markup",
	"language-php",
	"language-python",
	"language-regex",
	"language-sql",
	"language-xml",
	"language-shell",
];

