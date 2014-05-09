/**
 * @author meg mei
 * @date 2014-4-11
 * @content deal with the context menu
 */
var WindowPanel = (function(window, undefined) {
    var WindowPanel = function() {
        var arg = arguments, length = arguments.length;
        if(length === 0) {
            this._title = '';
            this._content = undefined;
        } else if(length === 1) {
            this._title = '';
            this._content = arg[0];
        }
        else if(length === 2) {
            this._title = arg[0];
            this._content = arg[1];
        }
    };

    /**
     * alert function
     * @param events
     */
    WindowPanel.prototype.alert = function(events) {
        if(null === document.getElementById('alertPanel')) {
            var div = document.createElement('div');
            div.id = 'alertPanel';
            div.className = 'alertpanel';
            var header = document.createElement('header');
            header.innerText = '';
            var ul = document.createElement('ul');
            var contentLi = document.createElement('div');
            contentLi.className = 'panelcontent';
            contentLi.innerText = this._content;
            var cancelLi = document.createElement('li');
            cancelLi.className = 'ok';
            cancelLi.innerHTML = '<div>Ok</div>';
            cancelLi.addEventListener('click', function () {
                this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
            });
            ul.appendChild(cancelLi);
            div.appendChild(header);
            div.appendChild(contentLi);
            div.appendChild(ul);
            document.body.appendChild(div);
        }
    };

    /**
     * confirm function
     * @param events
     */
    WindowPanel.prototype.confirm = function(events) {
        if(null === document.getElementById('confirmPanel')) {
            var div = document.createElement('div');
            div.id = 'confirmPanel';
            div.className = 'confirmpanel';
            var header = document.createElement('header');
            header.innerText = this._title;
            var ul = document.createElement('ul');
            var contentLi = document.createElement('div');
            contentLi.className = 'panelcontent';
            contentLi.innerText = this._content;
            var sureLi = document.createElement('li');
            var cancelLi = document.createElement('li');
            sureLi.className = 'confirmsure';
            sureLi.innerHTML = '<div>Sure</div>';
            cancelLi.className = 'confirmcancel';
            cancelLi.innerHTML = '<div>Cancel</div>';
            for (var key in events) { //register event
                sureLi.addEventListener(key, events[key]);
            }
            sureLi.addEventListener('click', function () {
                this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
            });
            cancelLi.addEventListener('click', function () {
                this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
            });
            ul.appendChild(sureLi);
            ul.appendChild(cancelLi);
            div.appendChild(header);
            div.appendChild(contentLi);
            div.appendChild(ul);
            document.body.appendChild(div);
        }
    };

    /**
     * show progress bar
     * return hock
     */
    WindowPanel.prototype.progressBar = function() {
        var that = this;
        if(null === document.getElementById('progresspanel')) {
            var div = document.createElement('div');
            div.id = 'progresspanel';
            div.className = 'progresspanel';
            var header = document.createElement('header');
            header.innerText = this._title;
            var ul = document.createElement('ul');
            ul.className = 'progress';
            var contentLi = document.createElement('li');
            contentLi.className = 'panelcontent';
            contentLi.innerText = this._content;
            var bar = document.createElement('li');
            bar.className = 'bar';
            var progressDiv = document.createElement('div');
            progressDiv.style.width = '0';

            bar.appendChild(progressDiv);
            ul.appendChild(contentLi);
            ul.appendChild(bar);
            div.appendChild(header);
            div.appendChild(ul);
            document.body.appendChild(div);
        }

        return function(rate) {
            contentLi.innerText = that._content;
            progressDiv.style.width = rate + '%';

            // remove itself
            if(rate === 100) {
                div.parentNode.removeChild(div);
            }
        };
    };

    /**
     * setTitle function
     * @param title
     */
    WindowPanel.prototype.setTitle = function(title){
        if(undefined === title){
            console.error('title is undefined !');
        }else{
            this._title = title;
        }
    };

    /**
     * setContent function
     * @param content
     */
    WindowPanel.prototype.setContent = function(content){
        if(undefined === content){
            console.error('content is undefined !');
        }else{
            this._content = content;
        }
    };



    return WindowPanel;
})(window);

