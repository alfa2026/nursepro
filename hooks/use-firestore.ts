import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestoreCollection(collectionName: string) {
  const [data, setData] = useState<any[]>([]); // مصفوفة فارغة بدلاً من الديمو
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collectionName) return;

    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(result); // سيتم تحديث الواجهة فور وجود بيانات حقيقية
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading };
}
