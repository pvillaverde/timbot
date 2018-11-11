import React, { Component } from 'react';
import './Navbar.css';
import NavbarItem from "./NavbarItem";
import ApiClient from "../Api/ApiClient";

export default class Navbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isConnected: false
        };
    }

    refreshStatus() {
        let nextIsConnected = ApiClient.isConnected;

        if (this.state.isConnected !== nextIsConnected) {
            this.setState({
                isConnected: nextIsConnected
            });
        }
    }

    componentDidMount() {
        this.checkInterval = setInterval(() => {
            this.refreshStatus();
        }, 250);

        this.refreshStatus();
    }

    componentWillUnmount() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className={"container"}>
                    <a className="navbar-brand mb-0 h1" href="/" title={"Timbot"}>
                        <img src="/images/timbot_bepis2.png" width="32" height="32"
                             className="d-inline-block align-top navbar-brand-image" alt="Timbot"/>
                        Timbot
                    </a>
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav mr-auto">
                            <NavbarItem title={"Dashboard"}/>
                        </ul>
                        <span className="navbar-text">
                            {this.state.isConnected && <span>Connected to Timbot</span>}
                            {!this.state.isConnected && <span>Connecting to Timbot</span>}
                            <div className={"navbar-status " + (this.state.isConnected ? "navbar-status--ok" : "navbar-status--busy")}/>
                        </span>
                    </div>
                </div>
            </nav>
        );
    }
}