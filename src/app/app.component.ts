import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild  } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { ViewFile, File } from './interface/file';
import { WebSocketService } from './services/web-socket.service';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('myGoogleMap', { static: false })
  map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false })
  info!: MapInfoWindow;

  title = 'Routes Control';
  excel_data:any[] = [];
  map_control:boolean = false
  markers = []  as  any;
  info_content:string = ''
  center!: google.maps.LatLngLiteral;
  dynamic_marker:any = null

  constructor(private socket: WebSocketService,
    public datepipe: DatePipe) {}

  ngOnInit(): void {
    this.socket.getData$().subscribe(({data}) => {
      console.log(data)
    })
  }

  async selectFile(){
    this.map_control=false;
    this.markers = [];
    this.dynamic_marker = null;
    const { value: file } = await Swal.fire({
      title: 'Seleccionar archivo',
      input: 'file',
      inputAttributes: {
        'aria-label': 'Subir archivo',
      }
    })
    
    if (file) {
      let reader = new FileReader()
      reader.readAsBinaryString(file)
      reader.onload = (e) => {
        var workbook = XLSX.read(reader.result,{type:"binary"})
        var sheet_names = workbook.SheetNames;
        this.excel_data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_names[0]])
        this.map_control=true;
        this.center = {
          lat: this.excel_data[0].Latitude,
          lng: this.excel_data[0].Longitude
        }
        this.excel_data.forEach( x => {
          let currentDateTime =this.datepipe.transform((new Date), 'yyyy-MM-dd hh:mm:ss');
          console.log(currentDateTime+' => Latitud:'+x.Latitude+" Longitud:"+x.Longitude)
          let json_format:ViewFile = { lat:x.Latitude, longi:x.Longitude,id_ruta:1,fecha:currentDateTime!}
          this.socket.sendMessage(JSON.stringify(json_format))
          this.addMarker(json_format)
        })
      }
    }
  }
  addMarker(data:any) {
    this.markers.push({
      position: {
        lat: data.lat,
        lng: data.longi,
      },
      title: 'Marcador #' + (this.markers.length + 1),
      info: data.fecha+' => lat:'+data.lat+" long:"+data.longi,
    });
  }
  openInfo(marker: MapMarker, content: any) {
    this.dynamic_marker=content;
    console.log(marker,content)
    this.info_content = content;
    this.info.open(marker)
  }
}
