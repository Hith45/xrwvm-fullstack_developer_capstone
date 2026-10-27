import React, { useEffect, useState } from "react";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";
import reviewIcon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealers, setDealers] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/djangoapp/getalldealers")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load dealerships");
        return response.json();
      })
      .then((data) => {
        setDealers(Array.isArray(data) ? data : []);
        setStates([
          ...new Set((Array.isArray(data) ? data : []).map((d) => d.state)),
        ].sort());
      })
      .catch((err) => setError(err.message));
  }, []);

  const filterDealers = async (state) => {
    setSelectedState(state);
    setError("");

    try {
      const url = state
        ? `/djangoapp/getdealers/${encodeURIComponent(state)}`
        : "/djangoapp/getalldealers";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Could not filter dealerships");

      const data = await response.json();
      setDealers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loggedIn = Boolean(sessionStorage.getItem("username"));

  return (
    <div>
      <Header />
      <main className="container mt-4">
        <h2>Our Dealerships</h2>

        <label htmlFor="state">Filter by state: </label>
        <select
          id="state"
          value={selectedState}
          onChange={(e) => filterDealers(e.target.value)}
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        {error && <p role="alert">{error}</p>}

        <div className="table-responsive mt-3">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Dealer Name</th>
                <th>City</th>
                <th>Address</th>
                <th>Zip</th>
                <th>State</th>
                {loggedIn && <th>Review Dealer</th>}
              </tr>
            </thead>
            <tbody>
              {dealers.map((dealer) => (
                <tr key={dealer.id}>
                  <td>{dealer.id}</td>
                  <td>
                    <a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a>
                  </td>
                  <td>{dealer.city}</td>
                  <td>{dealer.address}</td>
                  <td>{dealer.zip}</td>
                  <td>{dealer.state}</td>
                  {loggedIn && (
                    <td>
                      <a href={`/postreview/${dealer.id}`}>
                        <img
                          src={reviewIcon}
                          className="review_icon"
                          alt="Review Dealer"
                        />
                      </a>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dealers;
