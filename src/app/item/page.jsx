"use client";
import React, { useEffect, useState } from "react";
import styles from "./item.module.css";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  PaintBucket,
  Ruler,
  Frame,
  ALargeSmall,
  X,
} from "lucide-react";

const Page = () => {
  const [data, setData] = useState([]); // Original data from the API
  const [filteredData, setFilteredData] = useState([]); // Data after applying filters
  const [nameFilter, setNameFilter] = useState(""); // Filter by name
  const [designFilter, setDesignFilter] = useState(""); // Filter by design
  const [sizeFilter, setSizeFilter] = useState(""); // Filter by size
  const [colorFilter, setColorFilter] = useState(""); // Filter by color
  const [searchQuery, setSearchQuery] = useState(""); // General search query
  const [selectedItems, setSelectedItems] = useState(new Set()); // Track selected items for deletion
  const [showFilter, setsShowFilter] = useState(false);

  // Fetch data from the API
  useEffect(() => {
    const fetchingData = async () => {
      try {
        const response = await fetch("/api/saveData", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setData(data);
        setFilteredData(data); // Initialize filteredData with the fetched data
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchingData();
  }, []);

  // Apply filters whenever filter values or search query change
  useEffect(() => {
    const filtered = data.filter((item) => {
      const matchesName = nameFilter === "" || item.name === nameFilter;
      const matchesDesign = designFilter === "" || item.design === designFilter;
      const matchesSize = sizeFilter === "" || item.sizes.includes(sizeFilter);
      const matchesColor =
        colorFilter === "" || item.colors.includes(colorFilter);
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.design.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sizes.some((size) =>
          size.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        item.colors.some((color) =>
          color.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return (
        matchesName &&
        matchesDesign &&
        matchesSize &&
        matchesColor &&
        matchesSearch
      );
    });
    setFilteredData(filtered);
  }, [nameFilter, designFilter, sizeFilter, colorFilter, searchQuery, data]);

  // Get unique names, designs, sizes, and colors for dropdown options
  const uniqueNames = [...new Set(data.map((item) => item.name))];
  const uniqueDesigns = [...new Set(data.map((item) => item.design))];
  const uniqueSizes = [...new Set(data.flatMap((item) => item.sizes))];
  const uniqueColors = [...new Set(data.flatMap((item) => item.colors))];

  // Clear all filters
  const clearFilters = () => {
    setNameFilter("");
    setDesignFilter("");
    setSizeFilter("");
    setColorFilter("");
    setSearchQuery("");
  };

  // Handle item selection
  const handleSelectItem = (itemId) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId); // Deselect if already selected
    } else {
      newSelectedItems.add(itemId); // Select if not selected
    }
    setSelectedItems(newSelectedItems);
  };

  // Handle delete selected items
  const handleDeleteSelected = async () => {
    try {
      console.log("Selected IDs to delete:", Array.from(selectedItems)); // Log selected IDs

      const response = await fetch("/api/saveData", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: Array.from(selectedItems) }), // Send an array of IDs
      });

      console.log("Delete response:", response); // Log the response

      if (!response.ok) {
        const errorData = await response.json(); // Log error details
        console.error("Delete error details:", errorData);
        throw new Error("Failed to delete items");
      }

      // Update the UI after successful deletion
      const updatedData = data.filter((item) => !selectedItems.has(item.id));
      setData(updatedData);
      setFilteredData(updatedData);
      setSelectedItems(new Set()); // Clear selection after deletion
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className={styles.container}>
      {/* Filter Dropdowns */}
      <div
        className={styles.filterSection}
        style={{ display: showFilter ? "flex" : "none" }}
      >
        <h2 className={styles.filterInfo}>
          FITER THE ITEMS{" "}
          <X
            onClick={() => setsShowFilter(!showFilter)}
            size={28}
            strokeWidth={0.75}
          />
        </h2>
        <div className={styles.filterSelection}>
          <ALargeSmall size={28} strokeWidth={0.75} />
          <h2>NAME</h2>

          <select
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Filter by Name</option>
            {uniqueNames.map((name, index) => (
              <option key={`name-${index}`} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterSelection}>
          <Frame size={28} strokeWidth={0.75} />
          <h2>DESIGN</h2>

          <select
            value={designFilter}
            onChange={(e) => setDesignFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Filter by Design</option>
            {uniqueDesigns.map((design, index) => (
              <option key={`design-${index}`} value={design}>
                {design}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterSelection}>
          <Ruler size={28} strokeWidth={0.75} />
          <h2>SIZE</h2>

          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Filter by Size</option>
            {uniqueSizes.map((size, index) => (
              <option key={`size-${index}`} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterSelection}>
          <PaintBucket size={28} strokeWidth={0.75} />
          <h2>COLOR</h2>
          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Filter by Color</option>
            {uniqueColors.map((color, index) => (
              <option key={`color-${index}`} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className={styles.header}>
        <div className={styles.nav}>
          <Link href={"/"}>{"<Go back"}</Link>
          <h2>List Products</h2>
        </div>
        <div className={styles.tools}>
          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className={styles.inputField}>
              <Search size={28} strokeWidth={0.75} />

              <input
                type="text"
                placeholder="Search by name, design, size, or color"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div
              className={styles.filterButton}
              onClick={() => setsShowFilter(!showFilter)}
            >
              <SlidersHorizontal size={28} strokeWidth={0.75} />
              <h2>Filter</h2>
            </div>
          </div>

          {/* Clear Filters Button */}
          <button onClick={clearFilters} className={styles.clearButton}>
            Clear Filters
          </button>

          {/* Delete Selected Button */}
          <button
            onClick={handleDeleteSelected}
            disabled={selectedItems.size === 0}
            className={styles.deleteButton}
          >
            Delete Selected
          </button>
        </div>

        <div className={styles.items}>
          <li className={styles.name}>Select</li>
          <li className={styles.name}>Barcode</li>
          <li className={styles.name}>Name</li>
          <li className={styles.name}>Design</li>
          <li className={styles.name}>Sizes</li>
          <li className={styles.name}>Colors</li>
          <li className={styles.name}>Price</li>
        </div>
      </ul>

      {/* Display Filtered Data */}
      <div className={styles.itemBox}>
        {filteredData.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.select}>
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => handleSelectItem(item.id)}
              />
            </div>
            <div className={styles.design}>
              <span>Barcode: </span>
              <span>{item.barcode}</span>
            </div>
            <div className={styles.design}>
              <span>Name: </span>
              <span>{item.name}</span>
            </div>
            <div className={styles.design}>
              <span>Design: </span>
              <span>{item.design}</span>
            </div>
            <div className={styles.sizes}>
              <span>Sizes: </span>
              <ul>
                {item.sizes.map((size, index) => (
                  <li key={`${item.id}-size-${index}`}>{size}</li>
                ))}
              </ul>
            </div>
            <div className={styles.colors}>
              <span>Colors: </span>
              <ul>
                {item.colors.map((color, index) => (
                  <li key={`${item.id}-color-${index}`}>{color}</li>
                ))}
              </ul>
            </div>
            <div className={styles.price}>
              <span>Price: </span>
              <span>{item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
