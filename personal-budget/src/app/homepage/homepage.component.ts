import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import { resolve } from 'dns';


@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements AfterViewInit {

  public dataSource = {  datasets: [{
    data: [],
    backgroundColor: [
        '#ffcd56',
        '#ff6384',
        '#36a2eb',
        '#fd6b19',
        '#fd3a19',
        '#fdcd56',
        '#ffcd19',
    ],
}],

// These labels appear in the legend and in the tooltips when hovering different arcs
labels: []
};

@ViewChild("graphcontainer") element: ElementRef;
  public width: number;
  public height: number;
  public radius: number;
  public svg;
  public host;
  public htmlElement: HTMLElement;
  public pie;
  public arc;
  public outerArc;
  public key;
  public res;
  constructor(private http: HttpClient, private data: DataService) { }

  async ngAfterViewInit(): Promise<void> {

    this.res = await this.data.getData();
    console.log(this.data.get_data);
    console.log("__________________________");
    for (var i = 0; i < this.res.myBudget.length; i++){
        this.dataSource.datasets[0].data[i] = this.res.myBudget[i].budget;
        this.dataSource.labels[i] = this.res.myBudget[i].title;
      }
    this.createChart();
    this.initvalues(this.res);


    }

    createChart(){
      var ctx = document.getElementById('myChart');
      var myChart = new Chart(ctx, {
          type: 'pie',
          data: this.dataSource
      });
  }


/////// Code for d3js starts here///////
///////////////////////////////////////


    initvalues(res){
      this.htmlElement = this.element.nativeElement;
      this.host = d3.select(this.htmlElement);
      this.width = 430;
      this.height = 150;
      this.radius = Math.min(this.width, this.height) / 2;
      this.svg = this.host.append("svg").append("g").attr("viewBox", `0 0 ${this.width} ${this.height}`);
      this.svg.append("g").attr("class", "slices");
      this.svg.append("g").attr("class", "labels");
      this.svg.append("g").attr("class", "lines");

      this.arc = d3.arc().outerRadius(this.radius * 0.8).innerRadius(this.radius * 0.4);
      this.outerArc = d3.arc().innerRadius(this.radius * 0.9).outerRadius(this.radius * 0.9);
      this.svg.attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');
      this.key = this.dataSource.labels;
      this.getJSONData(res);

      this.change(this.getJSONData(res));
  }


    getJSONData(res){
      var data = [];
      var labels = [];
      var datamap = [];
      const value = [];
      for (var i = 0; i < res.myBudget.length; i++){
        labels[i] = res.myBudget[i].title;
        data[labels[i]] = res.myBudget[i].budget;
      }

      return labels.map(function(label){
        return {label: label, value: data[label]}
    });
    }

    midAngle(d){
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

    change(data) {

      var key = function(d){ return d.data.label; };
      //console.log(data);
      this.pie = d3.pie().sort(null).value(function(d) {
              return d['value'];
      });

      var color = d3.scaleOrdinal().domain(Object.keys(data))
        .range(['#87CEEB', '#FFA500', '#FBCCD1', '#D3D3D3', '#808080', '#ADD8E6', '#FF0000']);

        /* ------- PIE SLICES -------*/
      var slice = this.svg.select('.slices').selectAll('path.slice')
                  .data(this.pie(data), key);
      slice.enter()
                  .insert("path")
                  .attr("class", "slice")
                  .attr('d', this.arc)
                  .style("fill", function(d) { return color(d.data.label); })
                  ;

      slice
                  .transition().duration(11)
                  .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                          return this.arc(interpolate(t));
                      };
                  });

      slice.exit()
                  .remove();

        /* ------- TEXT LABELS -------*/

      var text = this.svg.select('.labels').selectAll('text')
            .data(this.pie(data), key);

      text.enter()
            .append('text')
            .attr('dy', '.35em')
            .text(function(d) {
                return d.data.label;
            }).transition()
            .attr("transform", function(d) {
              console.log("dfsfds");
              this.width = 400;
              this.height = 120;
              this.radius = Math.min(this.width, this.height) / 2;
              this.radius = this.radius + 30;
              this._current = this._current || d;
              var interpolate = d3.interpolate(this._current, d);
              this._current = interpolate(0);
              this.outerArc = d3.arc().innerRadius(this.radius * 0.4).outerRadius(this.radius * 0.9);
              this.arc = d3.arc().outerRadius(this.radius * 0.8).innerRadius(this.radius * 0.4);
              var pos = this.outerArc.centroid(this._current);
              var mid = this._current.startAngle + (this._current.endAngle - this._current.startAngle) / 2;
              pos[0] = this.radius * 0.95 * (mid < Math.PI ? 1 : -1);
              //offsets applied for larger text values
              if (this._current.index > 1) {
                pos[0] -= 45;
              }
              if (this._current.index > 4) {
                pos[0] -= 70;
              }
              return 'translate(' + pos[0] + ',' + pos[1]  + ')';
            });



        /* ------- SLICE TO TEXT POLYLINES -------*/

      var polyline = this.svg.select('.lines').selectAll('polyline')
            .data(this.pie(data), key);

      polyline.enter()
             .append('polyline').transition().duration(1000)
             .attr('points', function(d){
                this.width = 400;
                this.height = 120;
                this.radius = Math.min(this.width, this.height) / 2;
                this.radius = this.radius + 30;
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                this.outerArc = d3.arc().innerRadius(this.radius * 0.4).outerRadius(this.radius * 0.9);
                this.arc = d3.arc().outerRadius(this.radius * 0.8).innerRadius(this.radius * 0.4);
                var pos = this.outerArc.centroid(this._current);
                var mid = this._current.startAngle + (this._current.endAngle - this._current.startAngle) / 2;
                pos[0] = this.radius * 0.95 * (mid < Math.PI ? 1 : -1);
                return [this.arc.centroid(this._current), this.outerArc.centroid(this._current), pos];
            });

   }
}
