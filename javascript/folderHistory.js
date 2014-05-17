/**
 * @author megmei
 * @date 2014-5-16
 * @content use in go back and ahead function
 */
var FolderHistory = (function(window, undefined) {

    var _size ,_arrayObj,_cursor;

    var FolderHistory = function() {
        this._size = 1;
        this._cursor = 0;
        this._arrayObj  = new Array('/');
    };

    //save directory history
    FolderHistory.prototype.push = function(item) {
        if(this._cursor != (this._size - 1)){
            this._arrayObj.splice(this._cursor + 1, this._size - 1);
            this._size = this._cursor + 1;
        }
        this._arrayObj.push(item);
        this._size += 1;
        this._cursor = this._size - 1;
    }

    //get goAhead directory
    FolderHistory.prototype.goAhead = function() {
        if(this._cursor === (this._size - 1)){
            return this._arrayObj[this._cursor];
        }else{
            return this._arrayObj[++this._cursor];
        }

    };

    //get goBack directory
    FolderHistory.prototype.goBack = function() {
        if(this._cursor === 0){
            return this._arrayObj[this._cursor];
        }else{
            return this._arrayObj[--this._cursor];
        }

    };

    return FolderHistory;
})(window);

