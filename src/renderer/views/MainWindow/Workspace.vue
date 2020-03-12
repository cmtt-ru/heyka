<template>
    <div>
      <div>Main window. {{ $tc("message", seconds) }}</div>
      <svg-icon name="headphones" size="24"></svg-icon>
      <div>{{message}}</div>
      <div>
        <div>Input Text here</div>
        <textarea id="note" v-model="input"></textarea>
        <input type="button" id="save" value="Save" @click="Save()"/>
        <input type="button" id="load" value="Load"  @click="Load()"/>
      </div>
    </div>

</template>

<script>
import { ipcRenderer } from 'electron';
const { dialog } = require('electron').remote;
const fs = require('fs');

export default {
  data() {
    return {
      seconds: 0,
      message: '',
      input: '',
    };
  },

  methods: {
    Load() {
      dialog.showOpenDialog({
        properties: [ 'openFile' ],
      }).then(result => {
        console.log(result.canceled);
        console.log(result.filePaths);
        const filePath = result.filePaths[0];

        try {
          this.input = fs.readFileSync(filePath, 'utf-8');

          console.log('Loaded file:' + filePath);
        } catch (err) {
          console.log('Error reading the file: ' + JSON.stringify(err));
        }
      })
        .catch(err => {
          console.log(err);
        });
    },
    Save() {
      dialog.showSaveDialog({
        properties: [ 'openFile' ],
        title: 'test',
        filters: [ { extensions: [ 'txt' ] } ],
      }).then(result => {
        console.log(result);

        fs.writeFileSync(result.filePath, this.input, function (err) {
          if (err === undefined) {
            dialog.showMessageBox({
              message: 'The file has been saved!',
              buttons: [ 'OK' ],
            });
          } else {
            dialog.showErrorBox('File save error', err.message);
          }
        });
      })
        .catch(err => {
          console.log(err);
        });

      // dialog.showSaveDialog(function (filePath) {
      // if (filePath === undefined) {
      //     console.log(this.input);
      //     return;
      // }
      // fs.writeFileSync(filePath, this.input, function (err) {
      //     if (err === undefined) {
      //       dialog.showMessageBox({
      //         message: 'The file has been saved!',
      //         buttons: [ 'OK' ],
      //       });
      //     } else {
      //       dialog.showErrorBox('File save error', err.message);
      //     }
      // });
      // });
    },
  },

  mounted() {
    ipcRenderer.send('page-rendered', 'Hello from Main!');
    this.$i18n.locale = 'ru';

    const oneSecond = 1000;

    setInterval(() => {
      this.seconds += 1;
    }, oneSecond);

    console.log('mainWindow:', this.$route.query);
    this.message = this.$route.query.hash;
  },
};
</script>
