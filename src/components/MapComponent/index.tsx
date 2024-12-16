import * as React from 'react';
import GoogleMapReact from 'google-map-react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


let DefaultIcon = L.icon({
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

export class PositionMap {
	lat: number;
	lng: number;
	title?: string;
}
export interface IProps {
	centerMap: PositionMap;
	zoom: number;
	positionList: PositionMap[];
}

export default class MapComponent extends React.Component<IProps> {

	// center: PositionMap = { lat: 20.9764104, lng: 105.7852537, title: "title" };
	render() {
		const { centerMap,positionList,zoom } = this.props;
		return (
			<div style={{ height: "70vh", maxHeight: '500px' }}>
				{centerMap.lat != undefined && centerMap.lng != undefined &&
					<Map center={[centerMap.lat, centerMap.lng]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
						<TileLayer
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						/>
						{positionList.length > 0 && this.props.positionList.map((position, index) => (
							position.lat != undefined && position.lng != undefined &&
							<Marker key={index+"_map_"} position={[position.lat, position.lng]}>
								<Popup>{position.title}</Popup>
							</Marker>
						))}
					</Map>
				}
			</div>
		)
	}
}
