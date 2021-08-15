let input = document.getElementById('input');
let output = document.getElementById('output');

input.addEventListener('keyup', createMarkdown);

function createMarkdown(event) {
    downloadMarkdown(() => input.value);
    fetch(generateRequest(`/createmd`, input.value))
        .then(res => res.text())
        .then(data => {
            output.innerHTML = data;
            downloadHtml(() => data);
        })
        .catch(err => {
            console.log(err);
        });
};

function generateRequest(url, body) {
    let headers = new Headers();
    headers.append('Accept', 'text/html');
    headers.append('Content-Type', 'text/plain');
    let request = new Request(url, {
        mode: 'cors',
        method: 'POST',
        headers,
        body
    });
    return request;
};


function enableTab(textarea) {
    textarea.onkeydown = function (event) {
        if (event.keyCode === 9) {
            let value = this.value,
                start = this.selectionStart,
                end = this.selectionEnd;

            this.value = value.substring(0, start) + '\t' + value.substring(end);
            this.selectionStart = this.selectionEnd = start + 1;
            return false;
        }
    };
}

enableTab(input);

let downloadMdBtn = document.getElementById('download-md');
let downloadHtmlBtn = document.getElementById('download-html');

function downloadMarkdown(getText) {
    downloadMdBtn.addEventListener('click', function (event) {
        if (input.value) {
            let filename = document.getElementById('md-filename').value;
            let fileExt = filename.match(/\.\w+$/g)
            this.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(getText());
            this.setAttribute('download', `${filename ? filename : 'markdown'}${!fileExt ? '.md' : ''}`);
        } else {
            this.href = '#';
            this.removeAttribute('download');
        }
    });
}

function downloadHtml(getText) {
    downloadHtmlBtn.addEventListener('click', function (event) {
        if (output.innerText) {
            let filename = document.getElementById('html-filename').value;
            let fileExt = filename.match(/\.\w+$/g)
            this.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(getText());
            this.setAttribute('download', `${filename ? filename : 'markdown'}${!fileExt ? '.html' : ''}`);
        } else {
            this.href = '#';
            this.removeAttribute('download');
        }
    });
}



function sliderContent() {
    let content = document.getElementsByClassName('content')[0]
    ,   left = document.getElementById('left')
    ,   right = document.getElementById('right')
    ,   slider = document.getElementById('slider')
    ,   clicked = false;

    slider.addEventListener('mousedown', (event) => {
        event.preventDefault();
        clicked = true;

        document.addEventListener('mousemove', (event) => {
            if (!clicked) return false;
            let leftBoundary = left.getBoundingClientRect();
            let cp = 0;
            
            if (event.clientX < leftBoundary.left + 15) {
                cp = 15;
            } else if (event.clientX - leftBoundary.left > content.offsetWidth - 15) {
                cp = content.offsetWidth - 15;
            } else {
                cp = event.clientX - leftBoundary.left;
            }

            left.style.width = cp + 'px';
            right.style.width = (content.offsetWidth - cp) + 'px';
        });
    });
    
    document.addEventListener('mouseup', () => clicked = false);
    
}

sliderContent()  

