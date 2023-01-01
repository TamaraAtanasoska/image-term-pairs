/** @jsxRuntime classic */
/** @jsx jsx */

import React, { useState } from "react";
import { css, jsx } from "@emotion/react";
import { ImageWordPair } from "../App";

type RatingValues = "good-pair" | "bad-pair" | "bad-image" | "bad-word";

export interface ExportItem extends ImageWordPair {
  rating: RatingValues;
  size?: {
    height: number;
    width: number;
  };
}

const handleExportToFile = (data: any) => {
  const fileData = JSON.stringify(data);
  const blob = new Blob([fileData], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = "pairs-export.json";
  link.href = url;
  link.click();
};

export const PairScreener = ({
  pairsMap,
}: {
  pairsMap: Record<string, ImageWordPair>;
}) => {
  const indexes = Object.keys(pairsMap);
  const [size, setSize] = useState<{ width: number; height: number }>();
  const [currentImage, setCurrentImage] = useState(0);
  const [exportData, setExportData] = useState<ExportItem[]>([]);

  const [currentRating, setcurrentRating] = useState<RatingValues>("good-pair");

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setcurrentRating(event.target.value as RatingValues);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    setExportData([
      ...exportData,
      {
        rating: currentRating,
        word: pairsMap[indexes[currentImage]].word,
        path: indexes[currentImage],
        size,
      },
    ]);

    if (currentImage < indexes.length - 1) {
      setCurrentImage(currentImage + 1);
      setcurrentRating("good-pair");
    }
  };

  return Object.keys(pairsMap).length ? (
    <div
      css={{
        padding: "2em",
      }}
    >
      <div
        css={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => {
            handleExportToFile(exportData);
          }}
        >
          Download .json export
        </button>
      </div>
      <div css={{ display: "flex" }}>
        <div css={{ width: "70%", maxWidth: "70%" }}>
          <img
            alt={`${pairsMap[indexes[currentImage]].word}`}
            src={`data/images/${indexes[currentImage]}`}
            onLoad={(event) => {
              setSize({
                height: event.currentTarget.naturalHeight,
                width: event.currentTarget.naturalWidth,
              });
            }}
          />
        </div>
        <div css={{ width: "30%", minHeight: "100vh" }}>
          <h3>Word: {pairsMap[indexes[currentImage]].word.toUpperCase()}</h3>
          <p>
            Size: {size?.width}x{size?.height}
          </p>

          <form onSubmit={handleSubmit}>
            <div css={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="good-pair">
                <input
                  checked={currentRating === "good-pair"}
                  onChange={handleOnChange}
                  type="radio"
                  name="rating"
                  value="good-pair"
                  id="good-pair"
                />
                Good pair
              </label>

              <label htmlFor="bad-pair">
                <input
                  checked={currentRating === "bad-pair"}
                  onChange={handleOnChange}
                  type="radio"
                  name="rating"
                  value="bad-pair"
                  id="bad-pair"
                />
                Do not use pair
              </label>

              <label htmlFor="bad-image">
                <input
                  checked={currentRating === "bad-image"}
                  onChange={handleOnChange}
                  type="radio"
                  name="rating"
                  value="bad-image"
                  id="bad-image"
                />
                Do not use image
              </label>

              <label htmlFor="bad-word">
                <input
                  checked={currentRating === "bad-word"}
                  onChange={handleOnChange}
                  type="radio"
                  name="rating"
                  value="bad-word"
                  id="bad-word"
                />
                Do not use word
              </label>
              <button
                type="submit"
                disabled={currentImage === indexes.length - 1}
                css={{ width: "10em", marginTop: "2em" }}
              >
                Next pair
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <div>Loading</div>
  );
};
