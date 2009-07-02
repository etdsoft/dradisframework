
Ext.BLANK_IMAGE_URL = '/images/default/s.gif';
//Ext.state.Manager.setProvider(new Ext.state.CookieProvider);

// ------------------------------------------------------- custom ExtJS widgets
var nodestree = new dradis.NodesTree();
var notesbrowser = new dradis.NotesBrowser();
var importer = new dradis.importer.Panel();
var attachments = new dradis.attachments.AttachmentsPanel();

var dradistabs = new Ext.TabPanel({
  region: 'center',
  tabPosition: 'bottom',
  deferredRender: false,
  items: [
    notesbrowser,
    importer,
    attachments
  ]

});

var dradisoverview = new Ext.Panel({
  region: 'center',
  contentEl: 'first_render'
})

var dradisstatus = new Ext.StatusBar({
  region: 'south',
  defaultText: ''
});

var plugins = new dradis.plugins.PluginManager();

/*
 * ------------------------------------------------------- custom ExtJS widgets
 * Events thrown by the different widgets are handleded in this object and 
 * notifications are passed to other widgets of the interface were appropriate.
 * ----------------------------------------------------------------------------
 */

nodestree.on('nodeclick', function(node_id){
  notesbrowser.updateNotes(node_id);
  importer.updateSources(node_id);
  attachments.updateAttachments(node_id);
  if (dradistabs.getActiveTab() === null) {
    dradistabs.setActiveTab(0);
  }
});

importer.on('importrecord',function(record){ 
    notesbrowser.addNote(record.data.description ); 
    dradistabs.activate(notesbrowser);
});

Ext.Ajax.on('beforerequest', function(){ dradisstatus.showBusy(); }); 
Ext.Ajax.on('requestcomplete', function(){ dradisstatus.clearStatus({useDefaults:true}); }); 


/*
 * onReady gets called when the page is rendered, all the files are loaded and
 * we are ready to rock!
 */
Ext.onReady(function() {
  Ext.QuickTips.init();
  
  var centerelement;

  if (dradis.firstrender == true) {
    centerelement = dradisoverview;
  } else {
    centerelement = dradistabs;
  }

  var vp = new Ext.Viewport({
    layout: 'border',
    items: [
      {
        region: 'north',
        html: '<h1 class="x-panel-header" style="text-align: right;">'+dradis.version+' (<a href="/logout">logout</a>)</h1>',
        autoHeight: true,
        border: false,
        margins: '0 0 5 0',
        bbar: [ 
          { 
            text: 'file',
            menu: new Ext.menu.Menu({
              items:[
                {
                  text: 'import from file...', 
                  iconCls:'icon-form-magnify',
                  handler: function() {
                    var win = new Ext.Window({
                      title: 'Import from file',
                      layout: 'fit',
                      width: 290,
                      height: 230,
                      minWidth: 290,
                      minHeight: 230,
                      items: [
                        new dradis.plugins.UploadFormPanel()
                      ]
                    });
                    win.show();
                    win.center();
                  }
                }
              ]
            })
          },
          {
            text: 'export',
            tooltip: 'export dradis contents to external sources',
            iconCls: 'export',
            menu: plugins.exportPluginsMenu()
          }

        ]
      },
      nodestree,
      dradistabs,
      dradisstatus
        //{
        // console? do we need this?
        //region: 'south',
        //title: 'Information',
        //ollapsible: true,
        //html: 'Information goes here',
        //split: true,
        //height: 100,
        //minHeight: 100
        //xtype: 'statusbar'
        //}
    ]
  });
  vp.doLayout();
  Ext.TaskMgr.start({ run: checkrevision, interval: 10000 });
  plugins.refresh();
});
