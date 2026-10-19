import React from 'react';
import { FiMapPin, FiPhone, FiClock, FiMail } from 'react-icons/fi';
import { STORE } from '../utils/format';

const MAP_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.980087142759!2d106.69178737575241!3d10.812835558519666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528ea1ed5d617%3A0xe05984f26d8f0c4f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBWxINuIExhbmcgLSBDxqEgc-G7nyAy!5e0!3m2!1svi!2s!4v1700566388648!5m2!1svi!2s';

function Gmap() {
  return (
    <div className="container store">
      <div className="page-title"><h1>Hệ thống cửa hàng</h1></div>
      <div className="store-layout">
        <div className="card store-info">
          <h3>SkyShop</h3>
          <p><FiMapPin /> {STORE.address}</p>
          <p><FiPhone /> Hotline: <b>{STORE.hotline}</b></p>
          <p><FiMail /> {STORE.email}</p>
          <p><FiClock /> {STORE.hours}</p>
          <a className="btn btn-primary" href="https://maps.google.com/?q=10.812835558519666,106.69178737575241" target="_blank" rel="noreferrer">Chỉ đường</a>
        </div>
        <div className="card map-card">
          <iframe title="Bản đồ cửa hàng" src={MAP_SRC} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </div>
    </div>
  );
}
export default Gmap;
