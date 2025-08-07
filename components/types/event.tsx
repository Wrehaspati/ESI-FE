import { ICategory } from "./category"

export interface IEvent {
  id: string
  name: string
  prizepool: string
  event_logo: string
  event_banner: string
  created_at: string
  updated_at: string
  category: ICategory
  is_active:number
  external_link?: string
}