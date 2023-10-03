"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplifyName = exports.sumDecimals = exports.getWalletBalance = exports.dateIsValid = exports.zeroDateTime = exports.getLimitSkipSort = exports.createQueryString = exports.getQueryObject = exports.reformImage = exports.apostrophifyName = exports.splitCapital = exports.capitalize = exports.togglePassword = exports.addLetters = exports.addNumbers = exports.magnifyingGlass = exports.scrollThrough = exports.requestFullScreen = exports.insertAtCursor = exports.copyText = exports.replaceAsync = exports.urlify = exports.getCookie = exports.OHeightAspect = exports.heightAspect = exports.shuffle = exports.chooseFrom = exports.randomAmong = void 0;
const randomAmong = (num1, num2) => {
    return (Math.floor(Math.random() * (num2 - num1 + 1))) + num1;
};
exports.randomAmong = randomAmong;
const chooseFrom = (arr) => {
    return arr[(0, exports.randomAmong)(0, (arr.length - 1))];
};
exports.chooseFrom = chooseFrom;
const shuffle = (arr) => {
    let array = arr.slice();
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
exports.shuffle = shuffle;
const heightAspect = (element, ratio) => {
    window.addEventListener('resize', () => {
        element.style.height = (element.offsetWidth * ratio) + 'px';
    });
};
exports.heightAspect = heightAspect;
const OHeightAspect = (element, ratio) => {
    element.style.height = (element.offsetWidth * ratio) + 'px';
};
exports.OHeightAspect = OHeightAspect;
const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};
exports.getCookie = getCookie;
const urlify = (text) => {
    var urlRegex = /bats/ig;
    // var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig
    return text.replace(urlRegex, function (url) {
        return '<a target="_blank" href="' + url + '">' + url + '</a>';
    });
};
exports.urlify = urlify;
const replaceAsync = (str, regex, asyncFn) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    // @ts-ignore
    str.replace(regex, (match, ...args) => {
        const promise = asyncFn(match, ...args);
        promises.push(promise);
    });
    const data = yield Promise.all(promises);
    return str.replace(regex, () => data.shift());
});
exports.replaceAsync = replaceAsync;
const copyText = (text) => __awaiter(void 0, void 0, void 0, function* () {
    const textArea = document.createElement('textarea');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.bottom = '0';
    textArea.style.width = '2rem';
    textArea.style.height = '2rem';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.overflow = 'hidden';
    textArea.style.opacity = '0';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    yield navigator.clipboard.writeText(text);
    document.execCommand('copy');
    textArea.remove();
});
exports.copyText = copyText;
const insertAtCursor = (myField, myValue) => {
    //IE support
    // @ts-ignore
    if (document.selection) {
        myField.focus();
        // @ts-ignore
        sel = document.selection.createRange();
        // @ts-ignore
        sel.text = myValue;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart === '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
        myField.focus();
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    }
    else {
        myField.value += myValue;
    }
};
exports.insertAtCursor = insertAtCursor;
const requestFullScreen = (exit) => {
    if (exit) {
        if (document.fullscreenElement !== null) {
            document.exitFullscreen();
        }
        ;
        return false;
    }
    const element = document.documentElement;
    // @ts-ignore
    var requestMethod = element.requestFullscreen || element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullscreen;
    if (requestMethod) {
        requestMethod.call(element);
        // @ts-ignore
    }
    else if (typeof window.ActiveXObject !== "undefined") { // IE work
        // @ts-ignore
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
    // document.exitFullscreen()  Use this to exit
};
exports.requestFullScreen = requestFullScreen;
const scrollThrough = (vertical, horisontal = 0) => {
    window.scrollBy({ top: vertical, left: horisontal, behavior: 'smooth' });
};
exports.scrollThrough = scrollThrough;
const magnifyingGlass = (img, zoom = 2) => {
    // ! Keep in a div for relativity
    var glass, w, h, bw;
    /* Create magnifier glass: */
    glass = document.createElement("DIV");
    glass.setAttribute("class", "el-img-magnifier-glass");
    glass.style.zIndex = "1000";
    /* Insert magnifier glass: */
    if (img.parentElement)
        img.parentElement.insertBefore(glass, img);
    /* Set background properties for the magnifier glass: */
    glass.style.backgroundImage = "url('" + img.src + "')";
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
    bw = 3;
    w = glass.offsetWidth / 2;
    h = glass.offsetHeight / 2;
    /* Execute a function when someone moves the magnifier glass over the image: */
    glass.addEventListener("mousemove", moveMagnifier);
    img.addEventListener("mousemove", moveMagnifier);
    /*and also for touch screens:*/
    glass.addEventListener("touchmove", moveMagnifier);
    img.addEventListener("touchmove", moveMagnifier);
    function moveMagnifier(e) {
        var pos, x, y;
        /* Prevent any other actions that may occur when moving over the image */
        e.preventDefault();
        /* Get the cursor's x and y positions: */
        pos = getCursorPos(e);
        x = pos.x;
        y = pos.y;
        /* Prevent the magnifier glass from being positioned outside the image: */
        if (x > img.width - (w / zoom)) {
            x = img.width - (w / zoom);
        }
        if (x < w / zoom) {
            x = w / zoom;
        }
        if (y > img.height - (h / zoom)) {
            y = img.height - (h / zoom);
        }
        if (y < h / zoom) {
            y = h / zoom;
        }
        /* Set the position of the magnifier glass: */
        glass.style.left = (x - w) + "px";
        glass.style.top = (y - h) + "px";
        /* Display what the magnifier glass "sees": */
        glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
    }
    function getCursorPos(e) {
        var a, x = 0, y = 0;
        e = e || window.event;
        /* Get the x and y positions of the image: */
        a = img.getBoundingClientRect();
        /* Calculate the cursor's x and y coordinates, relative to the image: */
        // @ts-ignore
        x = e.pageX - a.left;
        // @ts-ignore
        y = e.pageY - a.top;
        /* Consider any page scrolling: */
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x: x, y: y };
    }
    // Info
    // The image MUST be encased in a container that contains nothing but the div
};
exports.magnifyingGlass = magnifyingGlass;
const addNumbers = (from, to, element, interval, increment = 1) => __awaiter(void 0, void 0, void 0, function* () {
    // Set increment to 1 if not number
    increment = typeof increment !== 'number' ? 1 : increment;
    // Set increment to 1 if zero
    increment = increment === 0 ? 1 : increment;
    // Set increment to positive or negative based on {from} and {to}
    increment = to > from ? (increment > 0 ? increment : -increment) : (increment > 0 ? -increment : increment);
    const reVal = yield new Promise((resolve, reject) => {
        element.innerHTML = from.toString();
        let preVal = from;
        let inx = setInterval(() => {
            let newNumb;
            if (parseInt(element.innerHTML) === to) {
                clearInterval(inx);
                newNumb = '`.-x-`.';
            }
            if (parseInt(element.innerHTML) !== preVal) {
                clearInterval(inx);
                newNumb = '`.-y-`.';
            }
            const terminal = increment > 0 ? (preVal + increment) >= to : (preVal - increment) <= to;
            if (newNumb === '`.-x-`.') {
                resolve('finished');
            }
            else if (newNumb === '`.-y-`.') {
                resolve('interrupted');
            }
            else if (terminal === true) {
                newNumb = to;
                element.innerHTML = newNumb.toString();
                preVal = newNumb;
            }
            else if (terminal === false) {
                newNumb = parseInt(element.innerHTML) + increment;
                element.innerHTML = newNumb.toString();
                preVal = newNumb;
            }
            else {
                clearInterval(inx);
                reject('Unknown');
            }
        }, interval);
    });
    return reVal;
});
exports.addNumbers = addNumbers;
const addLetters = (phrase, element, interval, toNfro, end) => __awaiter(void 0, void 0, void 0, function* () {
    element.innerHTML = '';
    let theText = element.innerHTML;
    end = end === undefined ? '' : end;
    let full = false;
    const nphrase = phrase;
    let number = 0;
    const reVal = yield new Promise((resolve, reject) => {
        let inx = setInterval(() => {
            let newPhrase;
            if (element.innerHTML === (phrase + end)) {
                newPhrase = '`.-x-`.';
            }
            // Checks if the phrase has once been completed
            if (full === true) {
                full = true;
            }
            else {
                if (newPhrase === '`.-x-`.') {
                    full = true;
                }
            }
            // Checks if another same operation is running and terminates older one
            let otherText = element.innerHTML;
            let over = false;
            if (full === false) {
                if (theText !== element.innerHTML) {
                    clearInterval(inx);
                    over = true;
                    resolve('interrupted');
                }
            }
            // Checks if dev wants it to go to and fro and if completed
            if (full === true && toNfro === 0) {
                clearInterval(inx);
                resolve('finished');
            }
            else {
                // Check if first stage has completed
                if (full === false) {
                    element.innerHTML = nphrase.slice(0, number) + end;
                    number++;
                }
                else {
                    if (number > 0) {
                        // Set timeout for second stage based on toNfro
                        setTimeout(() => {
                            number--;
                            if (number >= 0) {
                                if (theText !== element.innerHTML) {
                                    clearInterval(inx);
                                    over = true;
                                    resolve('finished');
                                }
                                otherText = element.innerHTML;
                                element.innerHTML = nphrase.slice(0, number) + end;
                                if (over === true) {
                                    element.innerHTML = otherText;
                                }
                                theText = element.innerHTML;
                            }
                        }, toNfro);
                    }
                    else {
                        clearInterval(inx);
                        resolve('finished');
                    }
                }
            }
            if (full === false) {
                if (over === true) {
                    element.innerHTML = otherText;
                }
                theText = element.innerHTML;
            }
        }, interval);
    });
    return reVal;
});
exports.addLetters = addLetters;
const togglePassword = (passwordInput, toggler, state) => {
    if (passwordInput.type === "password") {
        if (passwordInput.parentElement)
            passwordInput.parentElement.classList.remove('showing-text');
        if (passwordInput.parentElement)
            passwordInput.parentElement.classList.add('showing-password');
    }
    else {
        if (passwordInput.parentElement)
            passwordInput.parentElement.classList.remove('showing-password');
        if (passwordInput.parentElement)
            passwordInput.parentElement.classList.add('showing-text');
    }
    if (state === "hover") {
        toggler.addEventListener('mouseover', () => {
            passwordInput.type = 'text';
            if (passwordInput.parentElement)
                passwordInput.parentElement.classList.remove('showing-password');
            if (passwordInput.parentElement)
                passwordInput.parentElement.classList.add('showing-text');
        });
        toggler.addEventListener('mouseout', () => {
            passwordInput.type = 'password';
            if (passwordInput.parentElement)
                passwordInput.parentElement.classList.remove('showing-text');
            if (passwordInput.parentElement)
                passwordInput.parentElement.classList.add('showing-password');
        });
    }
    else if (state === "click") {
        toggler.addEventListener("click", (e) => {
            e.preventDefault();
            if (passwordInput.type === "password") {
                passwordInput.type = 'text';
                if (passwordInput.parentElement)
                    passwordInput.parentElement.classList.remove('showing-password');
                if (passwordInput.parentElement)
                    passwordInput.parentElement.classList.add('showing-text');
            }
            else {
                passwordInput.type = 'password';
                if (passwordInput.parentElement)
                    passwordInput.parentElement.classList.remove('showing-text');
                if (passwordInput.parentElement)
                    passwordInput.parentElement.classList.add('showing-password');
            }
        });
    }
};
exports.togglePassword = togglePassword;
const capitalize = (str) => {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};
exports.capitalize = capitalize;
const splitCapital = (str) => {
    let li = str.split('');
    li = li.map(s => {
        if (s === s.toUpperCase()) {
            return `-${s.toLowerCase()}`;
        }
        else
            return s;
    });
    return li.join('');
};
exports.splitCapital = splitCapital;
const apostrophifyName = (name) => {
    const end = name.length - 1;
    if (name[end] === 's')
        return name + "'";
    else
        return name + "'s";
};
exports.apostrophifyName = apostrophifyName;
const reformImage = (e, removeNext = false, remove = true) => {
    const smallSize = e.currentTarget;
    const fullSize = new Image();
    fullSize.src = smallSize.src.split('/').filter((value) => value !== 'blur').join('/');
    fullSize.onload = () => {
        try {
            fullSize.alt = smallSize.alt;
            fullSize.title = smallSize.title;
            if (smallSize.nextElementSibling && removeNext)
                smallSize.nextElementSibling.remove();
            if (remove)
                smallSize.replaceWith(fullSize);
        }
        catch (error) {
        }
    };
};
exports.reformImage = reformImage;
const getQueryObject = (href) => {
    var _a;
    if (href === void 0) { href = (_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.href; }
    const params = (new URL(href)).searchParams;
    const urlParams = {};
    // @ts-ignore
    for (let p of params) {
        urlParams[p[0]] = p[1];
    }
    return urlParams;
};
exports.getQueryObject = getQueryObject;
const createQueryString = (queryObject) => {
    let queryString = "?";
    const queryKeys = Object.keys(queryObject).filter((key) => queryObject[key]);
    for (const queryName of queryKeys) {
        const queryValue = queryObject[queryName];
        if (queryKeys.indexOf(queryName) === 0) {
            queryString = queryString + encodeURI(`${queryName}=${queryValue}`);
        }
        else {
            queryString = queryString + encodeURI(`&${queryName}=${queryValue}`);
        }
    }
    return queryString;
};
exports.createQueryString = createQueryString;
const getLimitSkipSort = (queryLimit, querySkip, querySort) => {
    let limit = 10;
    if (typeof queryLimit === "string") {
        // Limit limit to 20
        if (!isNaN(parseInt(queryLimit)))
            limit = parseInt(queryLimit) > 20 ? 20 : parseInt(queryLimit);
    }
    let skip = 0;
    if (typeof querySkip === "string") {
        if (!isNaN(parseInt(querySkip)))
            skip = parseInt(querySkip);
    }
    const sort = {};
    if (typeof querySort === "string") {
        const sortList = querySort.split(' || ');
        for (let i = 0; i < sortList.length; i++) {
            const querySort = sortList[i];
            const query = querySort.split(':');
            const order = query[1] === 'asc' ? 1 : -1;
            sort[query[0]] = order;
        }
    }
    return { limit, skip, sort };
};
exports.getLimitSkipSort = getLimitSkipSort;
const zeroDateTime = (date, to) => {
    // if (to === "start") date.setHours(0, 0, 0, 0)
    // else if (to === "end") date.setHours(23, 59, 59, 999)
    return date;
};
exports.zeroDateTime = zeroDateTime;
const dateIsValid = (date) => {
    if (date instanceof Date && !isNaN(date.getTime()))
        return true;
    else
        return false;
};
exports.dateIsValid = dateIsValid;
const getWalletBalance = () => {
    // web3 work
    // markal, this function is for you
    return (0, exports.randomAmong)(2000, 8000);
};
exports.getWalletBalance = getWalletBalance;
const sumDecimals = (arr) => {
    return arr.reduce((a, b) => (a) + (b * 1000), 0) / 1000;
};
exports.sumDecimals = sumDecimals;
const simplifyName = (str) => {
    let value = str;
    value = value.toLowerCase();
    value = value.replace(/[^a-z\-\_0-9]/g, "");
    return value;
};
exports.simplifyName = simplifyName;
