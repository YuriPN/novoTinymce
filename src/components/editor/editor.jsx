import React,  {Component} from 'react';
import { Editor } from '@tinymce/tinymce-react';
import socket from '../server/server'

import diff from '../htmldiff/htmldiff'


class RealTimeEditor extends Component{
    constructor(props){
        super(props)
        this.editor = React.createRef();
        this.state = {
            content: '',
            room: 'doc1',
            bm:'',
            interval: null
        }
        this.setContent = this.setContent.bind(this)
        this.updateDocument = this.updateDocument.bind(this)
        this.emitChange = this.emitChange.bind(this)
        this.handleEditorChange = this.handleEditorChange.bind(this)

        socket.on('update document', this.updateDocument)
        socket.emit('user connect', this.state.room)
    }

    handleEditorChange(text){
        this.setState({
            content:text
        })
    }
    emitChange(event){
        var bookm = this.editor.current.editor.selection.getBookmark(2, true)
        this.setState({
            bm:bookm
        })
        clearTimeout(this.state.interval);
        this.state.interval = setTimeout(function(){
            socket.emit('document change', event.target.innerHTML)
        }, 500);
    }

    updateDocument(innerhtml){
        var diffText  = diff(this.state.content, innerhtml) 
        var mergedHtml = diffText.replace(/<(DEL|del)[^>]*>[^<]*(<\/DEL>|<\/del>)/ig, '');
        if(this.state.content === ''){
            this.setState({
                content:innerhtml
            })
        }

        this.setState({
            content: mergedHtml
        })
    }

    setContent(){
        this.editor.current.editor.selection.moveToBookmark(this.state.bm)
    }

    render(){
        return(
            
            <Editor
                ref = { this.editor }
                value= { this.state.content }
                id='doc'
                init={{
                    plugins:'autosave code ',
                    toolbar: "code restoredraft",
                    autosave_interval: "30s"
                }}
                apiKey = '11mawuf4s296afp379jcddiaf0t6bb1buhxyipc2xwzfgeb5'
                onSetContent = { this.setContent }
                onKeyUp = { this.emitChange }
                onEditorChange = { this.handleEditorChange }
            />

        )
    }
}
export default RealTimeEditor;