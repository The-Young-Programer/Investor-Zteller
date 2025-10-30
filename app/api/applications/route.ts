import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const status = searchParams.get("status")

    let q = query(collection(db, "investors"))

    if (email) {
      q = query(collection(db, "investors"), where("email", "==", email), orderBy("createdAt", "desc"))
    } else if (status) {
      q = query(collection(db, "investors"), where("status", "==", status), orderBy("createdAt", "desc"))
    } else {
      q = query(collection(db, "investors"), orderBy("createdAt", "desc"))
    }

    const snapshot = await getDocs(q)
    const applications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
