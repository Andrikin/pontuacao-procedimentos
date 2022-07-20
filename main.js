const CATEGORIA_VALIDA = ['225170', '225125', '2231F9'];
const SIGTAP = 'http://sigtap.datasus.gov.br';
const APP = '/tabela-unificada/app/login.jsp';
const PUBLICADOS = '/tabela-unificada/app/sec/relatorio/procedimentoAtributos/publicados';
const SECURITY_CHECK = '/tabela-unificada/app/sec/relatorio/procedimentoAtributos/j_security_check';
const DATABASE = '1rclGQuOh68-d30pT7MFItOWHOUXM5TLw79i5eXLGSy4';
const REGISTROS = '102dpaslGU3nYAfQfJIzG5ZY188rl8CoJNGrrlR3wDn8';

// ==================== Início preparação ====================

class Cookie{
	constructor(cookie){
		this._cookie_dict = {};
		this._cookie_slice = cookie.split(';');
		for(let c in this._cookie_slice){
			let _c_split = this._cookie_slice[c].split('=');
			this._cookie_dict[_c_split[0].toUpperCase()] = _c_split[1];
		}
		this._cookie = cookie.match(/^(.+?)=/)[1];
		this._value = cookie.match(/^.+?=(.+?)\b;?/)[1];
		this._path = /path=/i.test(cookie) ? this._cookie_dict['PATH'] : '';
		this._expires = /expires=/i.test(cookie) ? this._cookie_dict['EXPIRES'] : '';
		if(this._expires){
			this._date_expires = new Date(this._expires);
		}
		this._domain = /domain=/i.test(cookie) ? this._cookie_dict['DOMAIN'] : '';
		this._samesite = /SameSite=/i.test(cookie) ? this._cookie_dict['SAMESITE'] : '';
		this._secure = /Secure/i.test(cookie);
		this._http_only = /HttpOnly/i.test(cookie);
	}
	get cookie(){
		return this._cookie;
	}
	get value(){
		return this._value;
	}
	get path(){
		return this._path;
	}
	get date(){
		return this._date_expires;
	}
	get domain(){
		return this._domain;
	}
	get samesite(){
		return this._samesite;
	}
	get expires(){
		return this._expires;
	}
	get http_only(){
		return this._http_only;
	}
	get secure(){
		return this._secure;
	}
}

class HTTPRequest{
	constructor(){
		this._r = UrlFetchApp.fetch;
		this._resposta = null; // Google's HTTPResponse
		this._headers = null; // dict respostas header
		this._cookies = {
			cookies: [],
			registrar(cookie){
				for(let c in this.cookies){
					if(cookie.cookie === this.cookies[c].cookie){
						if(cookie.value !== this.cookies[c].value){
							this.cookies.push(cookie);
							break;
						}
					} else {
						continue;
					}
					this.cookies.push(cookie);
				}
			},
			cookies(){
				return this.cookies;
			},
			str(){
				let cookies = '';
				for(let cookie in this.cookies){
					cookies += `${this.cookies[cookie].cookie}=${this.cookies[cookie].value};`;
				}
				return cookies.slice(0, -1);
			},
		}
	}
	set_cookies(){
		return this._cookies.str();
	}
	_request(metodo, url, opcoes){
		// url = str, opcoes = dict
		let _opcoes = {
			'method': metodo,
			'headers': {
				'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
				+ '(KHTML, like Gecko) Chrome/102.0.5005.115 Safari/537.36',
				'Cookies': this.set_cookies(),
			},
		};
		if(! opcoes){
			opcoes = _opcoes
		}
		if(opcoes['method'] !== metodo || ! 'method' in opcoes){
			opcoes['method'] = metodo;
		} else if (! opcoes['headers']){
			opcoes['headers'] = _opcoes['headers'];
		}
		this._resposta = this._r(url, opcoes);
		this._headers = this._resposta.getAllHeaders();
		console.log(this._headers);
		if(this._headers['Set-Cookie'] instanceof Array){
			for(let cookie in this._headers['Set-Cookie']){
				this._cookies.registrar(new Cookie(this._headers['Set-Cookie'][cookie]));
			}
		} else {
			this._cookies.registrar(new Cookie(this._headers['Set-Cookie']));
		}
	}
	get(url, opcoes){
		this._request('get', url, opcoes);
	}
	post(url, opcoes){
		this._request('post', url, opcoes);
	}
	get resposta(){
		return this._resposta;
	}
	get cookies(){
		return this._cookies.cookies;
	}
	get headers(){
		return this._headers;
	}
}

// ==================== Fim preparação ====================

class FiltroProcedimento{
	constructor(){
	}
}

function pesquisar_procedimento(){
	let request = new HTTPRequest();
	let opcoes = {
		'method': 'post',
		'payload': {
			'j_username': 'publico',
			'j_password': 'publico'
		}
	};
	request.get(SIGTAP + SECURITY_CHECK);
	console.log(request.resposta.getContentText());
	request.post(SIGTAP + SECURITY_CHECK, opcoes);
	console.log(request.resposta.getContentText());
}

function doGet(){
	return HtmlService.createHtmlOutputFromFile('main');
}
