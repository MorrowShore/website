document.addEventListener("DOMContentLoaded", function() {
	/* DOM building helper function */
	function el(name, attrs={}, ...children) {
		const element = document.createElement(name);
		for(const [key, value] of Object.entries(attrs)) {
			if(key === 'onclick')
				element.onclick = value;
			else
				element.setAttribute(key, value);
		}
		children.forEach(c => {
			if(typeof(c) === 'string') {
				c = document.createTextNode(c);
			}
			element.appendChild(c);
		});
		return element;
	}

	/* Navbar toggle (mobile) */
	document.getElementById("navbar-toggle").onclick = function() {
		this.classList.toggle("is-active");
		document.getElementById("navbar-menu").classList.toggle("is-active");
	};

	/* Thumbnail modal links */
	const closeModal = () => modal.classList.remove("is-active");
	const modal = el('div', {class: 'modal'},
		el('div', {class: 'modal-background', onclick: closeModal}),
		el('div', {class: 'modal-content'}),
		el('button', {class: 'modal-close', onclick: closeModal})
	);

	const showTumbnailModal = e => {
		e.preventDefault();
		const el = e.path.find(i => i.localName === 'a');
		modal.querySelector(".modal-content").innerHTML=`<img src="${el.getAttribute('href')}">`;
		modal.classList.add("is-active");
	}
	document.querySelectorAll("a.thumbnail-link").forEach(el => el.onclick = showTumbnailModal);
	document.body.appendChild(modal);

	/* Links that open in new windows */
	function openSmallNewWindow(e) {
		e.preventDefault();
		for(let i=0;i<e.path.length;++i) {
			if(e.path[i].nodeName == 'A') {
				window.open(e.path[i].href, 'smallwindow', 'width=500,height=600');
				break;
			}
		}
	}
	document.querySelectorAll("a.smallNewWindow").forEach(e => e.onclick=openSmallNewWindow);

	/* Tabs */
	document.querySelectorAll(".tab-container").forEach(tabContainer => {
		const tabbar = tabContainer.querySelector(".tabs>ul");
		const pages = tabContainer.querySelectorAll(".tab-page");
		tabbar.onclick = event => {
			event.preventDefault();

			const tabHash = event.srcElement.hash;
			if(!tabHash)
				return;

			const pageId = tabHash.substring(1);
			const tabId = 'tab-' + tabHash.substring(1);

			pages.forEach(p => p.id === pageId ? p.classList.remove("is-hidden-tablet") : p.classList.add("is-hidden-tablet"));
			tabbar.childNodes.forEach(c => c.id === tabId ? c.classList.add("is-active") : c.classList.remove("is-active"));

			if(history.pushState && window.location.hash != tabHash) {
				if(!window.location.hash) {
					history.replaceState(null, null, tabHash);
				} else {
					history.pushState(null, null, tabHash);
				}
			}
		};

		pages.forEach(page => {
			const header = page.querySelector("h1,h2,h3");
			header.classList.add("is-hidden-tablet");
			tabbar.appendChild(
				el('li', {id: `tab-${page.id}`},
					el('a', {href: `#${page.id}`},
						el('span', {class: 'icon'},
							el('i', {class: header.dataset.icon})
						),
						header.textContent
					)
				)
			);
		});

		let initial = window.location.hash;
		if(!initial) {
			// Guess OS (TODO move this away when tabs are used somewhere else too)
			if(navigator.platform.indexOf('Mac')>=0) {
				initial = '#OSX';
			} else if(navigator.platform.indexOf('Win')>=0) {
				initial = '#Windows';
			} else if(navigator.platform.indexOf('Linux')>=0) {
				initial = '#Linux';
			} else {
				initial = '#Source';
			}
		}
		const clickTab = hash => {
			const e = tabbar.querySelector(`#tab-${hash.substring(1)}>a`);
			console.log("clickTab", hash, e);
			if(e) e.click();
		}
		clickTab(initial);

		window.addEventListener('popstate', () => clickTab(window.location.hash));
	});
});

function getCookie(name) {
	if(document.cookie) {
		const prefix = name + '=';
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.startsWith(prefix)) {
				return decodeURIComponent(cookie.substring(prefix.length));
			}
		}
	}
	return null;
}

