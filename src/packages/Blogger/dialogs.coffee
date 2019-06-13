# Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

# AnTOS Web desktop is is licensed under the GNU General Public
# License v3.0, see the LICENCE file for more information

# This program is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of 
# the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.

# You should have received a copy of the GNU General Public License
#along with this program. If not, see https://www.gnu.org/licenses/.
class BloggerCategoryDialog extends this.OS.GUI.BasicDialog
    constructor: () ->
        super "BloggerCategoryDialog", {
            tags: [
                { tag: "afx-label", att: "data-height = '20', text = 'Pick a parent'" },
                { tag: "afx-tree-view" },
                { tag: "afx-label", att: "data-height = '20', text = 'Category name'" },
                { tag: "input", att: "type = 'text' data-height = '20'" }
            ],
            width: 200,
            height: 300,
            resizable: true,
            buttons: [
                {
                    label: "0k",
                    onclick: (d) ->
                        sel = (d.find "content1").get "selectedItem"
                        return d.notify __("Please select a parent category") unless sel
                        val = (d.find "content3").value
                        return d.notify __("Please enter category name") if val is "" and not d.data.selonly
                        return d.notify __("Parent can not be the category itself") if d.data.cat and d.data.cat.id is sel.id
                        d.handler { p: sel, value: val } if d.handler
                        d.quit()
                },
                {
                    label: "Cancel",
                    onclick: (d) -> d.quit()
                }
            ],
            filldata: (d) ->
                return unless d.data
                #console.log d.data
                tree = d.find "content1"
                tree.set "data", d.data.tree if d.data.tree
                if d.data.cat
                    it = (tree.find "id", d.data.cat.pid)[0]
                    tree.set "selectedItem", it
                    (d.find "content3").value = d.data.cat.name
                #(d.find "content0").set "text", d.data.label
                #(d.find "content1").value = d.data.value if d.data.value
            xtra: (d) ->
                $( d.find "content3" ).keyup (e) ->
                    (d.find "bt0").trigger() if e.which is 13
        }

# This dialog is use for cv section editing

class BloggerCVSectionDiaglog extends this.OS.GUI.BaseDialog
    constructor: () ->
        super "BloggerCVSectionDiaglog"

    init: () ->
        @render "#{@path()}/cvsection.html"

    main: () ->
        me = @
        @scheme.set "apptitle", @title
        @editor = new SimpleMDE
            element: @find "contentarea"
            status: false
            toolbar: false
        ($ (@select '[class = "CodeMirror-scroll"]')[0]).css "min-height", "50px"
        ($ (@select '[class="CodeMirror cm-s-paper CodeMirror-wrap"]')[0]).css "min-height", "50px"
        @on "vboxchange", () ->
            me.resizeContent()
            
        inputs = me.select "[input-class='user-input']"
        (($ v).val me.data[v.name] for v in inputs ) if me.data
        @editor.value me.data.content if me.data and me.data.content
        (me.find "section-publish").set "swon", (if Number(me.data.publish) then true else false)
        (@find "bt-cv-sec-save").set "onbtclick", (e) ->
            data = {}
            console.log inputs
            data[v.name] = ($ v).val() for v in inputs
            data.content = me.editor.value()
            return me.notify __("Title or content must not be blank") if data.title is "" and data.content is ""
            #return me.notify "Content must not be blank" if data.content is ""
            data.id = me.data.id if me.data and me.data.id
            if (me.find "section-publish").get "swon"
                data.publish = 1
            else
                data.publish = 0
            
            me.handler data if me.handler
            me.quit()
        me.resizeContent()
    resizeContent: () ->
        container = @find "editor-container"
        children = ($ container).children()
        cheight = ($ container).height() - 30
        ($ children[1]).css("height", cheight + "px")

# this dialog is for send mail
class BloggerSendmailDiaglog extends this.OS.GUI.BaseDialog
    constructor: () ->
        super "BloggerCVSectionDiaglog"

    init: () ->
        @render "#{@path()}/sendmail.html"
        @subdb = new @.parent._api.DB("subscribers")

    main: () ->
        # get db
        me = @
        @maillinglist = @find "email-list"
        title = (new RegExp "^#+(.*)\n", "g").exec @data.content
        (@find "mail-title").value = title[1]
        content = (@data.content.substring 0, 500) + "..."
        (@find "contentarea").value = BloggerSendmailDiaglog.template.format @data.id, content, @data.id

        @subdb.find {}, (d) ->
            return me.error __("Cannot fetch subscribers data: {0}", d.error) if d.error
            for v in d.result
                v.text = v.name
                v.switch = true
                v.checked = true

            me.maillinglist.set "items", d.result

        (@find "bt-sendmail").set "onbtclick", (e) ->
            items = me.maillinglist.get "items"
            emails = []
            emails.push v.email for v in items when v.checked is true
            return me.notify __("No email selected") if emails.length is 0
            # send the email
            data =
                path: "#{me.parent.path()}/sendmail.lua",
                parameters:
                    to: emails,
                    title: (me.find "mail-title").value,
                    content: (me.find "contentarea").value
            me._api.post "system/apigateway", data, (d) ->
                me.notify "Sendmail: {0}".format d
                me.quit()
            , (e, s) ->
                console.log e
                me.error __("Error sending mail: {0}", e.responseText)

            

BloggerSendmailDiaglog.template = """
Hello,

Xuan Sang LE has just published a new post on his blog: https://blog.lxsang.me/post/id/{0}

==========
{1}
==========


Read the full article via:
https://blog.lxsang.me/post/id/{2}

You receive this email because you have been subscribed to his blog.

Have a nice day,

Sent from Blogger, an AntOS application
"""