/**
 * @author Jackie lin
 * @date 2014-3-26
 * @content deal with the context menu
 */
var ContextMenu = (function(window, undefined) {
    /**
     * constructor
     * @param element
     * @param bindData [{itemName:***, itemClass:***, events:{***}}]
     * @constructor
     */
    var ContextMenu = function(position, bindData) {
        if(!position || !bindData) {
            console.log('position and bindData must be exists');
            return;
        }

        /*// judge the object is jQuery Object
        if(!element instanceof jQuery) {
            console.log('element must be jquery object');
            return;
        }*/

        var navigation = document.createElement('nav');
        navigation.className = 'contextmenu';

        // add position
        navigation.style.left = position.left + 'px';
        navigation.style.top = position.top + 'px';

        var ul = document.createElement('ul');

        // iteator the bindData
        for(var i = 0, t; t = bindData[i]; i++) {
            var li = document.createElement('li');
            li.className = t.itemClass;
            li.innerText = t.itemName;

            var events = t['events'];

            // register item event
            for(var key in events) {
                li.addEventListener(key, events[key]);
            }

            ul.appendChild(li);
        }

        navigation.appendChild(ul);
        this.navigation = navigation;
    };

    ContextMenu.prototype.addItem = function() {};

    ContextMenu.prototype.popItem = function() {};

    ContextMenu.prototype.getNavigation = function() {
        return this.navigation;
    };

    return ContextMenu;
})(window);
