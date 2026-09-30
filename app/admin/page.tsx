"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, IndianRupee, CalendarCheck, Activity } from "lucide-react"

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeUsers: 0,
    activePros: 0
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"))
        const bookingsSnapshot = await getDocs(bookingsQuery)
        
        let revenue = 0
        const bookingsData = bookingsSnapshot.docs.map(doc => {
          const data = doc.data()
          revenue += Number(data.price) || 0
          return { id: doc.id, ...data }
        })

        setBookings(bookingsData)
        
        // Mocking user/pro stats for now since we don't have separate collections set up yet
        setStats({
          totalRevenue: revenue,
          totalBookings: bookingsData.length,
          activeUsers: 145,
          activePros: 24
        })

      } catch (error) {
        console.error("Error fetching admin data", error)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">All Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">+19% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">+201 since last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Pros</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.activePros}</div>
                <p className="text-xs text-muted-foreground">+3 since last week</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.slice(0, 5).map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.bookingId}</TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.customerName || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{booking.customerPhone}</div>
                        </TableCell>
                        <TableCell>{booking.serviceName}</TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.scheduledDate}</div>
                          <div className="text-xs text-muted-foreground">{booking.scheduledTime}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">₹{booking.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.bookingId}</TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.customerName || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{booking.customerPhone}</div>
                      </TableCell>
                      <TableCell>{booking.serviceName}</TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.scheduledDate}</div>
                        <div className="text-xs text-muted-foreground">{booking.scheduledTime}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">₹{booking.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
