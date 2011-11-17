var lastSearch = "";
var bln = document.createElement( 'div' );
var bln_arrow = document.createElement( 'div' );
var bln_body = document.createElement( 'div' );
bln.appendChild( bln_arrow );
bln.appendChild( bln_body );

bln.className = 'altrans_bln_appear';
bln_arrow.id = 'altrans_bln_arrow';
bln_body.id = 'altrans_bln_load';

waitForClick();

/** send words to Bing translate API */
function sendWord( word ){
	if( word == lastSearch ) return;
	bln_body.innerHTML = "Translating...";
	bln_body.id = 'altrans_bln_load';
	safari.self.tab.dispatchMessage("searchThis", word );
	lastSearch = word;
}

safari.self.addEventListener('message',function( theMessageEvent ){
	if( theMessageEvent.name == "searchResult" ){
		bln_body.id = 'altrans_bln_show';
		bln_body.innerHTML = theMessageEvent.message;
		
		adjustBaloonLoc();
	}
},false);

function adjustBaloonLoc(){
	var _left = Number( bln.style.left.substr( 0, bln.style.left.length - 2 ) );
	var _top = Number( bln.style.top.substr( 0, bln.style.top.length - 2 ) );
	if( bln_arrow.id == 'altrans_bln_noarrow' ){
		if( _left < document.body.scrollLeft ){
			_left = document.body.scrollLeft + 20;
		}
		if( _left - document.body.scrollLeft > window.innerWidth - bln.offsetWidth ){
			_left = document.body.scrollLeft + window.innerWidth - bln.offsetWidth - 40;
		}
		if( _top - document.body.scrollTop > window.innerHeight - bln.offsetHeight ){
			_top = document.body.scrollTop + window.innerHeight - bln.offsetHeight - 30;
		}
		bln.style.left = _left + 'px';
		bln.style.top = _top + 'px';
	}
}

function waitForClick(){
	window.addEventListener( 'mouseup' , function( e ){
		
		if( e.altKey ) {
			var elem = document.activeElement;
			
			var tagname = elem.tagName.toLowerCase();
			var text = '';
			if( tagname == 'textarea' || tagname == 'input' ){
				//TEXTAREA or INPUT
				text = elem.value.toString();
				text = text.substr( elem.selectionStart, elem.selectionEnd - elem.selectionStart );
			}else{
				//BODY
				text = window.getSelection().toString();
			}
			
			if( text.length > 0 ){
				bln_body.innerHTML = "";
				bln.className = 'altrans_bln_appear';
				if( bln.parentNode == null ){
					document.body.appendChild( bln );
				}
				bln.style.zIndex = getLargestZIndex( 'div' );
				bln_arrow.id = 'altrans_bln_arrow';
				var _left = e.clientX + document.body.scrollLeft - Math.floor( bln.offsetWidth/2 );
				var _top = e.clientY + document.body.scrollTop + 15;
				
				if( _left < document.body.scrollLeft ){
					bln_arrow.id = 'altrans_bln_noarrow';
				}
				if( _left - document.body.scrollLeft > window.innerWidth - bln.offsetWidth ){
					bln_arrow.id = 'altrans_bln_noarrow';
				}
				if( _top - document.body.scrollTop > window.innerHeight - bln.offsetHeight ){
					bln_arrow.id = 'altrans_bln_noarrow';
				}
				bln.style.left = _left + 'px';
				bln.style.top = _top + 'px';
				
				adjustBaloonLoc();
				
				//to hide baloon
				bln_body.addEventListener( 'mouseout', hideBaloonHandler);
				bln_body.addEventListener( 'mouseup', eventKiller);//ignore clicking on baloon.
				window.addEventListener( 'mouseup', hideBaloonHandler);
				sendWord( text );
			}
		}
	});
}

function hideBaloonHandler( e ){
	bln_body.removeEventListener( 'mouseout', hideBaloonHandler );
	bln_body.removeEventListener( 'mouseup', eventKiller)
	window.removeEventListener( 'mouseup', hideBaloonHandler);
	bln.className = 'altrans_bln_disappear';
	lastSearch = "";
	setTimeout(function(){
		if( bln.parentNode && bln.className == 'altrans_bln_disappear' ){
			bln.parentNode.removeChild( bln );
		}
	}, 150 );
}

function eventKiller( e ){
	e.stopPropagation();
}