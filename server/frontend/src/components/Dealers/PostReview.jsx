import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header/Header";
import "./Dealers.css";
import "../assets/style.css";

const PostReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dealer, setDealer] = useState(null);
  const [cars, setCars] = useState([]);
  const [review, setReview] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2020");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionStorage.getItem("username")) {
      navigate("/login");
      return;
    }

    Promise.all([
      fetch(`/djangoapp/getdealer/${id}`).then((r) => {
        if (!r.ok) throw new Error("Dealer not found");
        return r.json();
      }),
      fetch("/djangoapp/getallcarmakes").then((r) => {
        if (!r.ok) throw new Error("Could not load car makes");
        return r.json();
      }),
    ])
      .then(([dealerData, carData]) => {
        setDealer(dealerData);
        setCars(Array.isArray(carData) ? carData : []);
      })
      .catch((err) => setError(err.message));
  }, [id, navigate]);

  const submitReview = async (e) => {
    e.preventDefault();
    setError("");

    if (!review.trim() || !make || !model || !year || !date) {
      setError("Complete all fields before submitting.");
      return;
    }

    const payload = {
      name:
        [sessionStorage.getItem("firstname"), sessionStorage.getItem("lastname")]
          .filter(Boolean)
          .join(" ") || sessionStorage.getItem("username"),
      dealership: Number(id),
      review: review.trim(),
      purchase: true,
      purchase_date: date,
      car_make: make,
      car_model: model,
      car_year: Number(year),
    };

    try {
      const response = await fetch("/djangoapp/add_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Review submission failed");
      }

      navigate(`/dealer/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Header />
      <main className="container mt-4">
        <h2>Post a Review</h2>
        {dealer && <h3>{dealer.full_name}</h3>}
        {error && <p role="alert">{error}</p>}

        <form onSubmit={submitReview}>
          <label htmlFor="review">Review</label>
          <textarea
            id="review"
            className="form-control mb-3"
            rows="5"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />

          <label htmlFor="date">Purchase Date</label>
          <input
            id="date"
            className="form-control mb-3"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label htmlFor="make">Car Make</label>
          <select
            id="make"
            className="form-control mb-3"
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setModel("");
            }}
            required
          >
            <option value="">Choose make</option>
            {cars.map((car) => (
              <option key={car.make} value={car.make}>{car.make}</option>
            ))}
          </select>

          <label htmlFor="model">Car Model</label>
          <select
            id="model"
            className="form-control mb-3"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          >
            <option value="">Choose model</option>
            {(cars.find((car) => car.make === make)?.models || []).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <label htmlFor="year">Car Year (2015–2023)</label>
          <input
            id="year"
            className="form-control mb-3"
            type="number"
            min="2015"
            max="2023"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />

          <button className="btn btn-primary" type="submit">
            Post Review
          </button>
        </form>
      </main>
    </div>
  );
};

export default PostReview;
