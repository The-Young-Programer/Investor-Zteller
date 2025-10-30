import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const q = query(collection(db, "investors"), where("email", "==", email))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return NextResponse.json({ applications: [] })
    }

    const applications = snapshot.docs.map((doc) => ({
      id: doc.id,
      email: doc.data().email,
      fullName: doc.data().fullName,
      investmentAmount: doc.data().investmentAmount,
      status: doc.data().status,
      createdAt: doc.data().createdAt,
    }))

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching application status:", error)
    return NextResponse.json({ error: "Failed to fetch application status" }, { status: 500 })
  }
}
