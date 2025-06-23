"use client"

import NavigationBar from '../navigation-bar';
import Footer from '../footer';
import { ChevronsRight, Globe } from 'lucide-react';
import React from 'react';
import axiosInstance from '@/lib/axios';
import useSWR from 'swr';
import { IEvent } from '../types/event';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import Link from 'next/link';

function FetchEvents() {
  const fetcher = (url: string) =>
    axiosInstance(url).then((r) => r.data?.data.filter((event: IEvent) => event.is_active === 1))

  const { data, isLoading } = useSWR(`/events`, fetcher)

  return {
    events: data || [],
    eventLoading: isLoading
  }
}

export default function Main() {
  const { events, eventLoading } = FetchEvents()
  const router = useRouter()

  const itemsPerPage = 6;
  const totalPages = events && events.length > 0 ? Math.ceil(events.length / itemsPerPage) : 1;

  const [alertPopup, setAlertPopup] = React.useState(() => {
    const saved = localStorage.getItem("alertPopup");
    return saved !== null ? JSON.parse(saved) : true;
  });

  React.useEffect(() => {
    localStorage.setItem("alertPopup", JSON.stringify(alertPopup));
  }, [alertPopup]);

  // Ensure the current page never goes out of bounds
  const [currentPage, setCurrentPage] = React.useState(1);
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedEvents = events?.slice(startIndex, startIndex + itemsPerPage) || [];

  // Handle event click, redirect to event activity page
  const handleEventClick = (event: IEvent) => {
    if (event.id == "6") {
      window.open("https://ticket-esi.bagoesesport.com", "_blank");
    }
    router.push(`/activity/?event=${event.id}`)
  }

  const EventCard = ({ event, index }: { event: IEvent, index: number }) => {
    return (
      <div key={index} onClick={() => handleEventClick(event)} className="bg-gray-900 rounded-sm p-5 w-full aspect-video z-20 relative bg-cover bg-center flex justify-between flex-col select-none cursor-pointer group" style={{ backgroundImage: `url(${event?.event_banner})` }}>
        <div className="flex justify-between items-start z-10">
          <div>
            <h1 className="text-white text-2xl font-supertall" style={{ textShadow: "2px 2px 4px black" }}>{event?.name.length > 40 ? `${event.name.slice(0, 40)}...` : event.name}</h1>
            <p className="text-white text-sm"></p>
          </div>
          <div>
            <ChevronsRight size={35} className="group-hover:scale-125 transition-all group-hover:animate-spin" />
          </div>
        </div>
        <div className='flex justify-between items-end z-10'>
          <div className="flex items-end gap-2 z-10">
            <Globe className='size-6 lg:size-8' />
            <p className="text-white lg:text-xl text-sm font-medium font-sans shadow-md">{event?.category?.name} Event</p>
          </div>
          <div>
            <Image alt="" src={event.event_logo ?? "/images/logo.png"} width={50} height={50} className="p-0.5 bg-white rounded-sm" />
          </div>
        </div>
        <div className='absolute left-0 top-0 w-full h-full bg-black opacity-75 group-hover:opacity-50 group-hover:duration-300 transition-all z-0'></div>
      </div>
    )
  }

  const PopupAlert = () => {
    return (
      <Dialog open={alertPopup} onOpenChange={setAlertPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pengumuman Penting!</DialogTitle>
            <DialogDescription>
              Pemberitahuan penting untuk seluruh atlet yang ingin mendaftar melalui platform web.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <p className="text-sm">
                Bagi peserta yang ingin berpartisipasi dalam lomba yang diselenggarakan, 
                peserta <b>diwajibkan untuk membuat akun</b> dan <b>mendaftarkan akun tersebut sebagai atlet </b> 
                dengan mengisi formulir yang disediakan.
              </p>
              <p className="text-sm">
                <b>Email</b> yang diperlukan di Formulir Pendaftaran Lomba akan dapat ter-deteksi setelah akun menggunakan email tersebut terdaftar sebagai atlet.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button asChild>
              <Link className='mt-2 md:mt-0' href={"/player-regist"}>Daftar Disini</Link>
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Tutup
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="bg-gray-900">
      <div className="lg:px-20 lg:pt-14 min-h-screen">
        {/* Header */}
        <NavigationBar />

        <PopupAlert /> 

        {/* Hero */}
        <div className="flex lg:text-2xl text-base font-supertall uppercase text-white px-5 lg:mt-10 mt-5 mb-5">
          <h1 className='z-10'># Highlighted Events</h1>
        </div>

        <div className="text-white grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 place-content-center gap-7 px-5">
          {eventLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton className="w-full aspect-video" key={index} />
            ))
          ) :
            selectedEvents.map((event: IEvent, index: number) => {
              return (
                <EventCard key={index} event={event} index={index} />
              )
            })
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="w-full flex-wrap md:w-full items-center justify-center text-white my-5 place-content-center flex">
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((prev) => Math.max(prev - 1, 1));
                      }}
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {currentPage == 1 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(totalPages);
                        }}
                      >
                        ...
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage - 1);
                        }}
                      >
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage + 1);
                        }}
                      >
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage == totalPages && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(1);
                        }}
                      >
                        ...
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                      }}
                      aria-disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
