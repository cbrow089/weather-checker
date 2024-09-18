import { Dayjs } from "dayjs";


export interface IWeather {
    city: string;
    date: Dayjs | string;
    tempF: number;
    windSpeed: number;
    humidity: number;
    icon: string;
    iconDescription: string;
  }
  